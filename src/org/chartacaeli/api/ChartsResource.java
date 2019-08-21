
package org.chartacaeli.api;

import java.io.IOException;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.util.Optional;
import java.util.UUID;

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
	private final static String MK_EEXCEPT = "eexcept" ;
	private final static String MK_EVALXML = "evalxml" ;
	private final static String MK_ED8NNAM = "ed8nnam" ;

	@Context
	private UriInfo uri ;

	@Context
	private ServletContext context ;

	private ChartDB chartDB = new ChartDB() ;

	@POST
	public Response charts(
			@FormParam( "chart")  String chart,
			@FormParam( "prefs" ) String prefs ) {
		Chart creq ;
		String cnam ;
		Link self, next ;
		URI nextURI ;
		CompositeResult result ;

		creq = new Chart() ;
		creq.setId( UUID.randomUUID().toString() ) ;
		creq.setCreated( System.currentTimeMillis() ) ;
		creq.setStatNum( Chart.ST_RECEIVED ) ;

		if ( ! ( result = validateD8N( chart, creq ) ).ok() ) {
			creq.setStatNum( Chart.ST_REJECTED ) ;
			creq.setInfo( MessageCatalog.getMessage( this, MK_EVALXML, new Object[] { "chart definition", result.message() } ) ) ;

			return Response.status( Response.Status.BAD_REQUEST )
					.entity( creq )
					.build() ;
		}
		if ( ! ( result = validateP9S( prefs, creq ) ).ok() ) {
			creq.setStatNum( Chart.ST_REJECTED ) ;
			creq.setInfo( MessageCatalog.getMessage( this, MK_EVALXML, new Object[] { "chart preferences", result.message() } ) ) ;

			return Response.status( Response.Status.BAD_REQUEST )
					.entity( creq )
					.build() ;
		}

		try {
			cnam = getChartName( chart ) ;
		} catch ( Exception e ) {
			creq.setInfo( MessageCatalog.getMessage( this, MK_ED8NNAM, new Object[] { e.toString() } ) ) ;

			return Response.status( Response.Status.INTERNAL_SERVER_ERROR )
					.entity( creq )
					.build() ;
		}
		creq.setName( cnam ) ;

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
		Link self, next ;
		URI nextURI ;

		qres = chartDB.findById( id ) ;

		if ( qres.isPresent() )
			creq = qres.get() ;
		else
			return Response.status( Response.Status.NOT_FOUND )
					.build() ;

		self = Link.fromUri( uri.getAbsolutePath() ).rel( "self" ).build() ;

		switch ( creq.getStatNum() ) {
		case Chart.ST_RECEIVED:
		case Chart.ST_ACCEPTED:
		case Chart.ST_REJECTED:
		case Chart.ST_STARTED:
		case Chart.ST_FAILED:
		case Chart.ST_CLEANED:
			return Response.status( Response.Status.OK )
					.links( self )
					.entity( creq )
					.build() ;
		case Chart.ST_FINISHED:
			nextURI = uri.getBaseUriBuilder().path( "db").path( id ).path( creq.getName()+".pdf" ).build() ;
			next = Link.fromUri( nextURI ).rel( "next" ).build() ;

			return Response.status( Response.Status.SEE_OTHER )
					.location( nextURI )
					.links( self, next )
					.entity( creq )
					.build() ;
		default:
			return Response.status( Response.Status.INTERNAL_SERVER_ERROR )
					.build() ;
		}
	}

	private String getChartName( String chart ) throws Exception {
		DocumentBuilderFactory factory ;
		DocumentBuilder builder ;
		Document cdef ;
		XPath xpath ;
		String name ;

		try {
			factory = DocumentBuilderFactory.newInstance() ;
			builder = factory.newDocumentBuilder() ;

			cdef = builder.parse( new InputSource( new StringReader( chart ) ) ) ;

			xpath = XPathFactory.newInstance().newXPath() ;
			name = xpath.evaluate( "/ChartaCaeli/@name", cdef ) ;
		} catch ( ParserConfigurationException
				| SAXException | IOException
				| XPathExpressionException e ) {
			throw new Exception( MessageCatalog.getMessage( this, MK_EEXCEPT, new Object[] { e.toString() } ) ) ;
		}

		return name ;
	}

	private CompositeResult validateD8N( final String chart, final Chart creq ) {
		CompositeResult valid ;

		valid = validateXML( chart, false ) ;

		return valid ;
	}

	private CompositeResult validateP9S( final String prefs, final Chart creq ) {
		CompositeResult valid ;

		if ( prefs == null || prefs.isEmpty() )
			return new SuccessResult() ;

		valid = validateXML( prefs, true ) ;

		return valid ;
	}

	private CompositeResult validateXML( final String xml, boolean parseAgainstDTD ) {
		DocumentBuilderFactory dactory ;
		DocumentBuilder builder ;
		SchemaFactory sactory ;
		Schema xsd ;
		URL url ;

		dactory = DocumentBuilderFactory.newInstance() ;
		if ( parseAgainstDTD )
			dactory.setValidating( true ) ;
		else {
			dactory.setValidating( false ) ;
			dactory.setNamespaceAware( true ) ;
			sactory = SchemaFactory.newInstance( XMLConstants.W3C_XML_SCHEMA_NS_URI ) ;

			try {
				url = new URL( context.getInitParameter( "schemaLocation" ) ) ;
				xsd = sactory.newSchema( url ) ;
				dactory.setSchema( xsd ) ;
			} catch ( MalformedURLException
					| SAXException e ) {
				return new FailureResult( MessageCatalog.getMessage( this, MK_EEXCEPT, new Object[] { e.toString() } ) ) ;
			}
		}

		try {
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
			builder.parse( new InputSource( new StringReader( xml ) ) ) ;
		} catch ( ParserConfigurationException
				| SAXException | IOException e ) {
			return new FailureResult( MessageCatalog.getMessage( this, MK_EEXCEPT, new Object[] { e.toString() } ) ) ;
		}

		return new SuccessResult() ;
	}
}
