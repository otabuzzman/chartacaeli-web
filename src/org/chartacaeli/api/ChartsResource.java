
package org.chartacaeli.api;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;
import java.util.logging.Logger;

import javax.servlet.ServletContext;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Link;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;
import org.xml.sax.ErrorHandler;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;

@Path( "/charts" )
public class ChartsResource {

	// message key (MK_)
	private final static String MK_ED8NINV = "ed8ninv" ;
	private final static String MK_EP9SINV = "ep9sinv" ;
	private final static String MK_EREQINI = "ereqini" ;

	@Context
	private UriInfo uri ;

	@Context
	private ServletContext context ;

	private ChartDB chartDB = new ChartDB() ;

	private Logger log = Logger.getLogger( ChartsResource.class.getName() ) ;

	@POST
	public Response charts(
			@FormParam( "chart")  String chart,
			@FormParam( "prefs" ) String prefs ) {
		Chart creq ;
		String outdir, reqdir ;
		Link self, next ;
		URI nextURI ;
		CompositeResult result ;

		creq = new Chart() ;
		creq.setId( UUID.randomUUID().toString() ) ;
		creq.setCreated( System.currentTimeMillis() ) ;
		creq.setStatNum( Chart.ST_RECEIVED ) ;

		if ( ! ( result = validateD8N( chart ) ).ok() ) {
			creq.setStatNum( Chart.ST_REJECTED ) ;
			creq.setInfo( result.message() ) ;

			return Response.status( result.getRC() )
					.entity( creq )
					.build() ;
		} else
			creq.setName( result.message() ) ;

		if ( ! ( result = validateP9S( prefs ) ).ok() ) {
			creq.setStatNum( Chart.ST_REJECTED ) ;
			creq.setInfo( result.message() ) ;

			return Response.status( result.getRC() )
					.entity( creq )
					.build() ;
		}

		outdir = context.getInitParameter( this.getClass().getName()+".outputPath" ) ;
		if ( outdir.charAt( 0 ) == '~' )
			outdir = System.getProperty( "user.home" )+outdir.substring( 1 ) ;
		reqdir = outdir+"/"+creq.getId() ;

		try {
			createDbFile( reqdir+"/"+creq.getName()+".xml", chart, true ) ;
			createDbFile( reqdir+"/"+creq.getName()+".preferences", prefs, false ) ;
		} catch ( IOException e ) {
			log.info( e.getMessage() ) ;

			creq.setStatNum( Chart.ST_REJECTED ) ;
			creq.setInfo( MessageCatalog.getMessage( this, MK_EREQINI, null ) ) ;

			return Response.status( Response.Status.INTERNAL_SERVER_ERROR )
					.entity( creq )
					.build() ;
		}

		creq.setStatNum( Chart.ST_ACCEPTED ) ;
		creq.setModified( System.currentTimeMillis() ) ;

		chartDB.insert( creq ) ;

		self = Link.fromUri( uri.getAbsolutePath() ).rel( "self" ).build() ;

		nextURI = uri.getAbsolutePathBuilder().path( creq.getId() ).build() ;
		next = Link.fromUri( nextURI ).rel( "next" ).build() ;

		return Response.status( Response.Status.ACCEPTED )
				.location( nextURI )
				.links( self, next )
				.entity( creq )
				.build() ;
	}

	@GET
	@Path( "/{id}" )
	public Response chart(
			@PathParam( value = "id" ) String id ) {
		Optional<Chart> qres ;
		Chart creq ;
		Link self, next, applog, pdferr ;
		URI nextURI, applogURI, pdferrURI ;

		qres = chartDB.findById( id ) ;

		if ( qres.isPresent() )
			creq = qres.get() ;
		else
			return Response.status( Response.Status.NOT_FOUND )
					.build() ;

		self = Link.fromUri( uri.getAbsolutePath() ).rel( "self" ).build() ;

		switch ( creq.getStatNum() ) {
		case Chart.ST_ACCEPTED:
		case Chart.ST_STARTED:
		case Chart.ST_CLEANED:
			return Response.status( Response.Status.OK )
					.links( self )
					.entity( creq )
					.build() ;
		case Chart.ST_FINISHED:
			nextURI = uri.getBaseUriBuilder().path( "db" ).path( id ).path( creq.getName()+".pdf" ).build() ;
			next = Link.fromUri( nextURI ).rel( "next" ).build() ;
			applogURI = uri.getBaseUriBuilder().path( "db" ).path( id ).path( creq.getName()+".log" ).build() ;
			applog = Link.fromUri( applogURI ).rel( "related" ).build() ;

			return Response.status( Response.Status.SEE_OTHER )
					.location( nextURI )
					.links( self, next, applog )
					.entity( creq )
					.build() ;
		case Chart.ST_FAILED:
			applogURI = uri.getBaseUriBuilder().path( "db" ).path( id ).path( creq.getName()+".log" ).build() ;
			applog = Link.fromUri( applogURI ).rel( "related" ).build() ;
			pdferrURI = uri.getBaseUriBuilder().path( "db" ).path( id ).path( creq.getName()+".err" ).build() ;
			pdferr = Link.fromUri( pdferrURI ).rel( "related" ).build() ;

			return Response.status( Response.Status.INTERNAL_SERVER_ERROR )
					.links( self, applog, pdferr )
					.entity( creq )
					.build() ;
		case Chart.ST_RECEIVED:
		case Chart.ST_REJECTED:
		default:
			return Response.status( Response.Status.INTERNAL_SERVER_ERROR )
					.build() ;
		}
	}

	private CompositeResult validateD8N( final String chart ) {
		Document cdef ;
		XPath xpath ;
		String name ;

		if ( chart == null )
			return new FailureResult( MessageCatalog.getMessage( this, MK_ED8NINV, null ) ) ;

		try {
			cdef = validateXML( chart, false ) ;

			xpath = XPathFactory.newInstance().newXPath() ;
			name = xpath.evaluate( "/*[local-name() = 'ChartaCaeli']/@name", cdef ) ;

		} catch ( SAXException e ) {
			log.info( e.getMessage() ) ;

			return new FailureResult( Response.Status.BAD_REQUEST, MessageCatalog.getMessage( this, MK_ED8NINV, null ) ) ;
		} catch ( XPathExpressionException // cannot happen actually
				| ParserConfigurationException
				| IOException e ) {
			log.info( e.getMessage() ) ;

			return new FailureResult( Response.Status.INTERNAL_SERVER_ERROR, MessageCatalog.getMessage( this, MK_ED8NINV, null ) ) ;
		}

		return new SuccessResult( name ) ;
	}

	private CompositeResult validateP9S( final String prefs ) {

		if ( prefs == null )
			return new SuccessResult() ;

		try {
			validateXML( prefs, true ) ;
		} catch ( SAXException
				| MalformedURLException e ) {
			log.info( e.getMessage() ) ;

			return new FailureResult( Response.Status.BAD_REQUEST, MessageCatalog.getMessage( this, MK_EP9SINV, null ) ) ;
		} catch ( ParserConfigurationException
				| IOException e ) {
			log.info( e.getMessage() ) ;

			return new FailureResult( Response.Status.INTERNAL_SERVER_ERROR, MessageCatalog.getMessage( this, MK_EP9SINV, null ) ) ;
		}

		return new SuccessResult() ;
	}

	private Document validateXML( final String xml, boolean parseAgainstDTD ) throws SAXException, ParserConfigurationException, IOException {
		DocumentBuilderFactory dactory ;
		DocumentBuilder builder ;
		SchemaFactory sactory ;
		Schema xsd ;
		URL url ;

		dactory = DocumentBuilderFactory.newInstance() ;
		if ( parseAgainstDTD )
			dactory.setValidating( true ) ;
		else { // parseAgainstXSD
			dactory.setValidating( false ) ;
			dactory.setNamespaceAware( true ) ;
			sactory = SchemaFactory.newInstance( XMLConstants.W3C_XML_SCHEMA_NS_URI ) ;

			url = new URL( context.getInitParameter( this.getClass().getName()+".schemaLocation" ) ) ;
			xsd = sactory.newSchema( url ) ;
			dactory.setSchema( xsd ) ;
		}

		builder = dactory.newDocumentBuilder() ;
		builder.setErrorHandler( new ErrorHandler() {

			@Override
			public void warning( SAXParseException e ) throws SAXException {
				throw new SAXException( e ) ;
			}

			@Override
			public void fatalError( SAXParseException e ) throws SAXException {
				throw new SAXException( e ) ;
			}

			@Override
			public void error( SAXParseException e ) throws SAXException {
				throw new SAXException( e ) ;
			}
		} ) ;

		return builder.parse( new InputSource( new StringReader( xml ) ) ) ;
	}

	private static void createDbFile( String filename, String data, boolean mkdirs ) throws IOException {
		File file ;
		FileOutputStream fos ;
		OutputStreamWriter osw ;

		if ( data == null )
			return ;

		file = new File( filename ) ;

		if ( mkdirs )
			file.getParentFile().mkdirs() ;

		fos = new FileOutputStream( file ) ;
		osw = new OutputStreamWriter( fos, StandardCharsets.UTF_8 ) ;
		osw.append( data ) ;

		osw.close() ;
	}
}
