
package org.chartacaeli.api;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.net.MalformedURLException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;
import java.util.logging.Logger;

import javax.servlet.ServletContext;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Link;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.core.UriInfo;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.hibernate.exception.GenericJDBCException;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

@Path( "/charts" )
public class ChartsResource {

	// message key (MK_)
	private final static String MK_ED8NINV = "ed8ninv" ;
	private final static String MK_EP9SINV = "ep9sinv" ;
	private final static String MK_EREQINI = "ereqini" ;

	// Mediatypes
	private final static String MT_APPLICATION_PDF = "application/pdf" ;
	private final static String MT_TEXT_PLAIN_UTF8 = MediaType.TEXT_PLAIN+";charset="+StandardCharsets.UTF_8 ;

	// rfc 5988 title strings
	private final static String L_APPLOG = "Charta Caeli core application log file" ;
	private final static String L_PDFERR = "Ghostscript PDF conversion error file" ;

	@Context
	private UriInfo uri ;

	@Context
	private ServletContext context ;

	// web.xml
	private final String CF_OUTDIR = ".outputDirectory" ;

	private ChartDB chartDB = new ChartDB() ;

	private Logger log = Logger.getLogger( ChartsResource.class.getName() ) ;

	public ChartsResource() {
	}

	@POST
	@Produces( {
		MediaType.APPLICATION_JSON,
		MediaType.APPLICATION_XML } )
	public Response charts(
			@HeaderParam( "Accept" ) String accept,
			@FormParam( "chart")  String chart,
			@FormParam( "prefs" ) String prefs ) {
		Chart creq ;
		Link self, next ;
		URI nextURI ;
		String type ;
		CompositeResult result ;

		if ( accept.equals( MediaType.APPLICATION_XML ) )
			type = MediaType.APPLICATION_XML ;
		else
			type = MediaType.APPLICATION_JSON ;

		self = Link.fromUri( uri.getAbsolutePath() ).rel( "self" ).build() ;

		creq = new Chart() ;
		creq.setId( UUID.randomUUID().toString() ) ;
		creq.setCreated( System.currentTimeMillis() ) ;
		creq.setStatNum( Chart.ST_RECEIVED ) ;
		creq.setHateoas( self ) ;

		if ( chart == null ) {
			creq.setStatNum( Chart.ST_REJECTED ) ;
			creq.setInfo( MessageCatalog.getMessage( this, MK_ED8NINV, null ) ) ;

			return Response.status( Response.Status.BAD_REQUEST )
					.links( self )
					.type( type )
					.entity( creq )
					.build() ;
		}

		if ( ! ( result = validateD8N( chart ) ).ok() ) {
			creq.setStatNum( Chart.ST_REJECTED ) ;
			creq.setInfo( result.message() ) ;

			return Response.status( result.getRC() )
					.links( self )
					.type( type )
					.entity( creq )
					.build() ;
		} else
			creq.setName( result.message() ) ;

		if ( ! ( result = validateP9S( prefs ) ).ok() ) {
			creq.setStatNum( Chart.ST_REJECTED ) ;
			creq.setInfo( result.message() ) ;

			return Response.status( result.getRC() )
					.links( self )
					.type( type )
					.entity( creq )
					.build() ;
		}

		try {
			createFile( getD8NFilename( creq ), chart ) ;
			createFile( getP9SFilename( creq ), prefs ) ;

			creq.setStatNum( Chart.ST_ACCEPTED ) ;
			creq.setModified( System.currentTimeMillis() ) ;

			chartDB.insert( creq ) ;
		} catch ( NullPointerException
				| IOException e ) {
			log.info( e.getMessage() ) ;

			creq.setStatNum( Chart.ST_REJECTED ) ;
			creq.setInfo( MessageCatalog.getMessage( this, MK_EREQINI, null ) ) ;

			return Response.status( Response.Status.INTERNAL_SERVER_ERROR )
					.links( self )
					.type( type )
					.entity( creq )
					.build() ;
		} catch ( GenericJDBCException e ) {
			log.info( e.getMessage() ) ;

			creq.setStatNum( Chart.ST_REJECTED ) ;
			creq.setInfo( e.getMessage() ) ;

			return Response.status( Response.Status.INTERNAL_SERVER_ERROR )
					.links( self )
					.type( type )
					.entity( creq )
					.build() ;
		}

		nextURI = uri.getAbsolutePathBuilder().path( creq.getId() ).build() ;
		next = Link.fromUri( nextURI ).rel( "next" ).build() ;

		creq.setHateoas( next ) ;

		return Response.status( Response.Status.ACCEPTED )
				.links( self, next )
				.type( type )
				.entity( creq )
				.build() ;
	}

	@GET
	@Produces( {
		MediaType.APPLICATION_JSON,
		MediaType.APPLICATION_XML } )
	@Path( "/{id}" )
	public Response chart(
			@HeaderParam( "Accept" ) String accept,
			@PathParam( value = "id" ) String id ) {
		Optional<Chart> qres ;
		Chart creq ;
		Link self, next, log, err ;
		URI nextURI, logURI, errURI ;
		String type ;
		ResponseBuilder response ;

		if ( accept.equals( MediaType.APPLICATION_XML ) )
			type = MediaType.APPLICATION_XML ;
		else
			type = MediaType.APPLICATION_JSON ;

		qres = chartDB.findById( id ) ;

		if ( qres.isPresent() )
			creq = qres.get() ;
		else
			return Response.status( Response.Status.NOT_FOUND )
					.build() ;

		self = Link.fromUri( uri.getAbsolutePath() ).rel( "self" ).build() ;

		creq.setHateoas( self ) ;

		switch ( creq.getStatNum() ) {
		case Chart.ST_ACCEPTED:
		case Chart.ST_STARTED:
			next = Link.fromUri( uri.getAbsolutePath() ).rel( "next" ).build() ;

			creq.setHateoas( next ) ;

			return Response.status( Response.Status.OK )
					.links( self, next )
					.type( type )
					.entity( creq )
					.build() ;
		case Chart.ST_CLEANED:
			return Response.status( Response.Status.OK )
					.links( self )
					.type( type )
					.entity( creq )
					.build() ;
		case Chart.ST_FINISHED:
			nextURI = uri.getAbsolutePathBuilder().path( creq.getName()+".pdf" ).build() ;
			next = Link.fromUri( nextURI ).rel( "next" ).build() ;
			logURI = uri.getAbsolutePathBuilder().path( creq.getName()+".log" ).build() ;
			log = Link.fromUri( logURI ).rel( "related" ).title( L_APPLOG ).build() ;

			if ( ! probeFile( getPDFFilename( creq ) ) )
				return Response.status( Response.Status.INTERNAL_SERVER_ERROR )
						.links( self )
						.type( type )
						.entity( creq )
						.build();

			creq.setHateoas( next ) ;

			response = Response.status( Response.Status.OK )
					.links( self, next )
					.type( type )
					.entity( creq ) ;

			if ( probeFile( getLogFilename( creq ) ) ) {
				creq.setHateoas( log ) ;

				response.links( log ) ;
			}

			return response.build() ;
		case Chart.ST_FAILED:
			logURI = uri.getAbsolutePathBuilder().path( creq.getName()+".log" ).build() ;
			log = Link.fromUri( logURI ).rel( "related" ).title( L_APPLOG ).build() ;
			errURI = uri.getAbsolutePathBuilder().path( creq.getName()+".err" ).build() ;
			err = Link.fromUri( errURI ).rel( "related" ).title( L_PDFERR ).build() ;

			response = Response.status( Response.Status.INTERNAL_SERVER_ERROR )
					.links( self )
					.type( type )
					.entity( creq ) ;

			if ( probeFile( getLogFilename( creq ) ) ) {
				creq.setHateoas( log ) ;

				response.links( log ) ;
			}

			if ( probeFile( getErrFilename( creq ) ) ) {
				creq.setHateoas( err ) ;

				response.links( err ) ;
			}

			return response.build() ;
		case Chart.ST_RECEIVED:
		case Chart.ST_REJECTED:
		default:
			return Response.status( Response.Status.INTERNAL_SERVER_ERROR )
					.links( self )
					.type( type )
					.entity( creq )
					.build() ;
		}
	}

	@GET
	@Path( "/{id}/{file: .+[.](pdf|log|err)$}" )
	public Response chart(
			@HeaderParam( "Accept" ) String accept,
			@PathParam( value = "id" ) String id,
			@PathParam( value = "file" ) String file ) {
		String path ;
		ResponseBuilder response ;

		path = getOutputDirectroy()
				+"/"+id
				+"/"+file ;

		if ( ! probeFile( path ) )
			return Response.status( Response.Status.NOT_FOUND )
					.build() ;

		response = Response.ok( new File( path ) ) ;

		if ( file.substring( file.length()-4).equals( ".pdf" ) )
			response.type( MT_APPLICATION_PDF ) ;
		else
			response.type( MT_TEXT_PLAIN_UTF8 ) ;

		return response.build() ;
	}

	private CompositeResult validateD8N( final String chart ) {
		Document cdef ;
		XPath xpath ;
		String name ;

		if ( chart == null )
			return new FailureResult( MessageCatalog.getMessage( this, MK_ED8NINV, null ) ) ;

		try {
			cdef = new D8NParser( context ).parse( chart ) ;

			xpath = XPathFactory.newInstance().newXPath() ;
			name = xpath.evaluate( "/*[local-name() = 'ChartaCaeli']/@name", cdef ) ;

		} catch ( MalformedURLException
				| SAXException e ) {
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
			new P9SParser( context ).parse( prefs ) ;
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

	private String getD8NFilename( final Chart creq ) {
		return getOutputDirectroy()
				+creq.getPath()
				+".xml" ;
	}

	private String getP9SFilename( final Chart creq ) {
		return getOutputDirectroy()
				+creq.getPath()
				+".preferences" ;
	}

	private String getPDFFilename( final Chart creq ) {
		return getOutputDirectroy()
				+creq.getPath()
				+".pdf" ;
	}

	private String getLogFilename( final Chart creq ) {
		return getOutputDirectroy()
				+creq.getPath()
				+".log" ;
	}

	private String getErrFilename( final Chart creq ) {
		return getOutputDirectroy()
				+creq.getPath()
				+".err" ;
	}

	private void createFile( final String filename, final String data ) throws IOException {
		File file, path ;
		FileOutputStream stream ;
		OutputStreamWriter writer ;

		file = new File( filename ) ;
		path = file.getParentFile() ;

		if ( ! path.exists() )
			path.mkdirs() ;

		stream = new FileOutputStream( file ) ;
		writer = new OutputStreamWriter( stream, StandardCharsets.UTF_8 ) ;

		writer.append( data ) ;
		writer.close() ;
	}

	private boolean probeFile( final String filename ) {
		File file ;

		file = new File( filename ) ;

		if ( file.exists() && file.length()>0 )
			return true ;
		return false ;
	}

	private String getOutputDirectroy() {
		String key, val, dir ;

		key = this.getClass().getName()+CF_OUTDIR ;
		val = context.getInitParameter( key ) ;

		if ( val.charAt( 0 ) == '~' )
			dir = System.getProperty( "user.home" )
			+val.substring( 1 ) ;
		else
			dir = val ;

		return dir ;
	}
}
