
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

import javax.persistence.PersistenceException;
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

import org.w3c.dom.Document;
import org.xml.sax.SAXException;

@Path( "/charts" )
public class ChartsResource {

	// message key (MK_)
	private final static String MK_ED8NINV = "ed8ninv" ;
	private final static String MK_EP9SINV = "ep9sinv" ;
	private final static String MK_EREQINI = "ereqini" ;
	private final static String MK_ENOENT  = "enoent" ;

	// rfc5988 title strings
	private final static String L_D8NFIL = "Star chart definition (D8N) file" ;
	private final static String L_P9SFIL = "Star chart preferences (P9S) file" ;
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
	public Response postChart(
			@HeaderParam( "Accept" ) String accept,
			@FormParam( "chart")  String chart,
			@FormParam( "prefs" ) String prefs ) {
		Chart creq ;
		Link self, next, d8n, p9s ;
		URI nextURI, d8nURI, p9sURI ;
		CompositeResult result ;

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
					.type( accept )
					.entity( creq )
					.build() ;
		}

		try {
			if ( ! ( result = validateD8N( chart ) ).ok() ) {
				creq.setStatNum( Chart.ST_REJECTED ) ;
				creq.setInfo( result.message() ) ;

				return Response.status( result.getRC() )
						.links( self )
						.type( accept )
						.entity( creq )
						.build() ;
			}

			creq.setName( result.message() ) ;

			d8nURI = uri.getAbsolutePathBuilder().path( creq.getId() ).path( creq.getName()+".xml" ).build() ;
			d8n = Link.fromUri( d8nURI ).rel( "related" ).title( L_D8NFIL ).build() ;
			creq.setHateoas( d8n ) ;

			createFile( createFilename( d8nURI, creq.getId() ), chart ) ;
			log.info( d8nURI.getPath().substring( d8nURI.getPath().indexOf( creq.getId() ) ) ) ;

			if ( ! ( result = validateP9S( prefs ) ).ok() ) {
				creq.setStatNum( Chart.ST_REJECTED ) ;
				creq.setInfo( result.message() ) ;

				return Response.status( result.getRC() )
						.links( self )
						.type( accept )
						.entity( creq )
						.build() ;
			}

			p9sURI = uri.getAbsolutePathBuilder().path( creq.getId() ).path( creq.getName()+".preferences" ).build() ;
			p9s = Link.fromUri( p9sURI ).rel( "related" ).title( L_P9SFIL ).build() ;
			creq.setHateoas( p9s ) ;

			createFile( createFilename( p9sURI, creq.getId() ), prefs ) ;

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
					.type( accept )
					.entity( creq )
					.build() ;
		} catch ( PersistenceException e ) {
			log.info( e.getMessage() ) ;

			creq.setStatNum( Chart.ST_REJECTED ) ;
			creq.setInfo( e.getMessage() ) ;

			return Response.status( Response.Status.INTERNAL_SERVER_ERROR )
					.links( self )
					.type( accept )
					.entity( creq )
					.build() ;
		}

		nextURI = uri.getAbsolutePathBuilder().path( creq.getId() ).build() ;
		next = Link.fromUri( nextURI ).rel( "next" ).build() ;
		creq.setHateoas( next ) ;


		return Response.status( Response.Status.ACCEPTED )
				.links( self, next, d8n, p9s )
				.type( accept )
				.entity( creq )
				.build() ;
	}

	@GET
	@Produces( {
		MediaType.APPLICATION_JSON,
		MediaType.APPLICATION_XML } )
	@Path( "/{id}" )
	public Response getChart(
			@HeaderParam( "Accept" ) String accept,
			@PathParam( value = "id" ) String id ) {
		Optional<Chart> qres ;
		Chart creq ;
		Link self, next, d8n, p9s, log, err ;
		URI nextURI, d8nURI, p9sURI, logURI, errURI ;
		ResponseBuilder response ;

		qres = chartDB.findById( id ) ;

		self = Link.fromUri( uri.getAbsolutePath() ).rel( "self" ).build() ;

		if ( qres.isPresent() ) {
			creq = qres.get() ;
			creq.setHateoas( self ) ;
		} else {
			creq = new Chart() ;
			creq.setId( id ) ;
			creq.setCreated( System.currentTimeMillis() ) ;
			creq.setModified( creq.getCreated() ) ;
			creq.setStatNum( Chart.ST_NONE ) ;
			creq.setHateoas( self ) ;
			creq.setInfo( MessageCatalog.getMessage( this, MK_ENOENT, null ) ) ;

			return Response.status( Response.Status.NOT_FOUND )
					.links( self )
					.type( accept )
					.entity( creq )
					.build() ;
		}

		d8nURI = uri.getAbsolutePathBuilder().path( creq.getId() ).path( creq.getName()+".xml" ).build() ;
		d8n = Link.fromUri( d8nURI ).rel( "related" ).title( L_D8NFIL ).build() ;

		p9sURI = uri.getAbsolutePathBuilder().path( creq.getId() ).path( creq.getName()+".preferences" ).build() ;
		p9s = Link.fromUri( p9sURI ).rel( "related" ).title( L_P9SFIL ).build() ;

		switch ( creq.getStatNum() ) {
		case Chart.ST_ACCEPTED:
		case Chart.ST_STARTED:
			next = Link.fromUri( uri.getAbsolutePath() ).rel( "next" ).build() ;
			creq.setHateoas( next ) ;

			creq.setHateoas( d8n ) ;
			creq.setHateoas( p9s ) ;

			return Response.status( Response.Status.OK )
					.links( self, next, d8n, p9s )
					.type( accept )
					.entity( creq )
					.build() ;
		case Chart.ST_CLEANED:
			return Response.status( Response.Status.OK )
					.links( self )
					.type( accept )
					.entity( creq )
					.build() ;
		case Chart.ST_FINISHED:
			nextURI = uri.getAbsolutePathBuilder().path( creq.getName()+".pdf" ).build() ;
			next = Link.fromUri( nextURI ).rel( "next" ).build() ;
			logURI = uri.getAbsolutePathBuilder().path( creq.getName()+".log" ).build() ;
			log = Link.fromUri( logURI ).rel( "related" ).title( L_APPLOG ).build() ;

			creq.setHateoas( d8n ) ;
			creq.setHateoas( p9s ) ;

			if ( ! probeFile( createFilename( nextURI, creq.getId() ) ) )
				return Response.status( Response.Status.INTERNAL_SERVER_ERROR )
						.links( self, d8n, p9s )
						.type( accept )
						.entity( creq )
						.build();

			creq.setHateoas( next ) ;

			response = Response.status( Response.Status.OK )
					.links( self, d8n, p9s, next )
					.type( accept )
					.entity( creq ) ;

			if ( probeFile( createFilename( logURI, creq.getId() ) ) ) {
				creq.setHateoas( log ) ;

				response.links( log ) ;
			}

			return response.build() ;
		case Chart.ST_FAILED:
			logURI = uri.getAbsolutePathBuilder().path( creq.getName()+".log" ).build() ;
			log = Link.fromUri( logURI ).rel( "related" ).title( L_APPLOG ).build() ;
			errURI = uri.getAbsolutePathBuilder().path( creq.getName()+".err" ).build() ;
			err = Link.fromUri( errURI ).rel( "related" ).title( L_PDFERR ).build() ;

			creq.setHateoas( d8n ) ;
			creq.setHateoas( p9s ) ;

			response = Response.status( Response.Status.INTERNAL_SERVER_ERROR )
					.links( self, d8n, p9s )
					.type( accept )
					.entity( creq ) ;

			if ( probeFile( createFilename( logURI, creq.getId() ) ) ) {
				creq.setHateoas( log ) ;

				response.links( log ) ;
			}

			if ( probeFile( createFilename( errURI, creq.getId() ) ) ) {
				creq.setHateoas( err ) ;

				response.links( err ) ;
			}

			return response.build() ;
		case Chart.ST_RECEIVED:
		case Chart.ST_REJECTED:
		default:
			creq.setHateoas( d8n ) ;
			creq.setHateoas( p9s ) ;

			return Response.status( Response.Status.INTERNAL_SERVER_ERROR )
					.links( self, d8n, p9s )
					.type( accept )
					.entity( creq )
					.build() ;
		}
	}

	@GET
	@Path( "/{id}/{file: .+[.](pdf|log|err|xml|preferences)$}" )
	public Response getChartFile(
			@PathParam( value = "id" ) String id,
			@PathParam( value = "file" ) String file ) {
		String path, suffix ;
		Chart creq ;
		Link self ;
		ResponseBuilder response ;

		path = getOutputDirectroy()
				+"/"+id
				+"/"+file ;

		self = Link.fromUri( uri.getAbsolutePath() ).rel( "self" ).build() ;

		if ( ! probeFile( path ) ) {
			creq = new Chart() ;
			creq.setId( id ) ;
			creq.setCreated( System.currentTimeMillis() ) ;
			creq.setModified( creq.getCreated() ) ;
			creq.setStatNum( Chart.ST_NONE ) ;
			creq.setHateoas( self ) ;
			creq.setInfo( MessageCatalog.getMessage( this, MK_ENOENT, null ) ) ;

			return Response.status( Response.Status.NOT_FOUND )
					.links( self )
					.type( MediaType.APPLICATION_JSON )
					.entity( creq )
					.build() ;
		}

		response = Response.ok( new File( path ) )
				.links( self ) ;

		suffix = file.substring( file.length()-4) ;

		if ( suffix.equals( ".pdf" ) )
			response.type( "application/pdf" ) ;
		else if ( suffix.equals( ".log" ) )
			response.type( MediaType.TEXT_PLAIN+";charset="+StandardCharsets.UTF_8 ) ;
		else if ( suffix.equals( ".err" ) )
			response.type( MediaType.TEXT_PLAIN+";charset="+StandardCharsets.UTF_8 ) ;
		else if ( suffix.equals( ".xml" ) )
			response.type( MediaType.APPLICATION_XML ) ;
		else // if ( suffix.equals( ".preferences" ) )
			response.type( MediaType.APPLICATION_XML ) ;

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
			return new FailureResult( MessageCatalog.getMessage( this, MK_EP9SINV, null ) ) ;

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

	private String createFilename( final URI uri, final String id ) {
		return getOutputDirectroy()+"/"+uri.getPath().substring( uri.getPath().indexOf( id ) ) ;
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
