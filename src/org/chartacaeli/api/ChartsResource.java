
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
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Link;
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

	@Context
	private UriInfo uri ;

	@Context
	private ServletContext context ;

	// web.xml
	private final String CF_OUTDIR = ".outputPath" ;

	private ChartDB chartDB = new ChartDB() ;

	private Logger log = Logger.getLogger( ChartsResource.class.getName() ) ;

	public ChartsResource() {
	}

	@POST
	public Response charts(
			@FormParam( "chart")  String chart,
			@FormParam( "prefs" ) String prefs ) {
		Chart creq ;
		Link self, next ;
		URI nextURI ;
		CompositeResult result ;

		self = Link.fromUri( uri.getAbsolutePath() ).rel( "self" ).build() ;

		creq = new Chart() ;
		creq.setId( UUID.randomUUID().toString() ) ;
		creq.setCreated( System.currentTimeMillis() ) ;
		creq.setStatNum( Chart.ST_RECEIVED ) ;

		if ( chart == null ) {
			creq.setInfo( MessageCatalog.getMessage( this, MK_ED8NINV, null ) ) ;
			return Response.status( Response.Status.BAD_REQUEST )
					.links( self )
					.entity( creq )
					.build() ;
		}

		if ( ! ( result = validateD8N( chart ) ).ok() ) {
			creq.setStatNum( Chart.ST_REJECTED ) ;
			creq.setInfo( result.message() ) ;

			return Response.status( result.getRC() )
					.links( self )
					.entity( creq )
					.build() ;
		} else
			creq.setName( result.message() ) ;

		if ( ! ( result = validateP9S( prefs ) ).ok() ) {
			creq.setStatNum( Chart.ST_REJECTED ) ;
			creq.setInfo( result.message() ) ;

			return Response.status( result.getRC() )
					.links( self )
					.entity( creq )
					.build() ;
		}

		try {
			createFile( getD8NFilename( creq ), chart ) ;
			createFile( getP9SFilename( creq ), prefs ) ;
		} catch ( NullPointerException
				| IOException e ) {
			log.info( e.getMessage() ) ;

			creq.setStatNum( Chart.ST_REJECTED ) ;
			creq.setInfo( MessageCatalog.getMessage( this, MK_EREQINI, null ) ) ;

			return Response.status( Response.Status.INTERNAL_SERVER_ERROR )
					.links( self )
					.entity( creq )
					.build() ;
		}

		creq.setStatNum( Chart.ST_ACCEPTED ) ;
		creq.setModified( System.currentTimeMillis() ) ;

		chartDB.insert( creq ) ;

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
		Link self, next, log, err ;
		URI nextURI, logURI, errURI ;
		ResponseBuilder resbldr ;

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
			nextURI = uri.getBaseUriBuilder().path( creq.getPath()+".pdf" ).build() ;
			next = Link.fromUri( nextURI ).rel( "next" ).build() ;
			logURI = uri.getBaseUriBuilder().path( creq.getPath()+".log" ).build() ;
			log = Link.fromUri( logURI ).rel( "related" ).build() ;

			if ( ! probeFile( getPDFFilename( creq ) ) )
				return Response.status( Response.Status.INTERNAL_SERVER_ERROR )
						.links( self )
						.entity( creq )
						.build();

			resbldr = Response.status( Response.Status.SEE_OTHER )
					.location( nextURI )
					.links( self, next )
					.entity( creq ) ;

			if ( probeFile( getLogFilename( creq ) ) )
				resbldr.links( log ) ;

			return resbldr.build() ;
		case Chart.ST_FAILED:
			logURI = uri.getBaseUriBuilder().path( creq.getPath()+".log" ).build() ;
			log = Link.fromUri( logURI ).rel( "related" ).build() ;
			errURI = uri.getBaseUriBuilder().path( creq.getPath()+".err" ).build() ;
			err = Link.fromUri( errURI ).rel( "related" ).build() ;

			resbldr = Response.status( Response.Status.INTERNAL_SERVER_ERROR )
					.links( self )
					.entity( creq ) ;

			if ( probeFile( getLogFilename( creq ) ) )
				resbldr.links( log ) ;

			if ( probeFile( getErrFilename( creq ) ) )
				resbldr.links( err ) ;

			return resbldr.build() ;
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
		return getOutputPath()
				+creq.getPath()
				+".xml" ;
	}

	private String getP9SFilename( final Chart creq ) {
		return getOutputPath()
				+creq.getPath()
				+".preferences" ;
	}

	private String getPDFFilename( final Chart creq ) {
		return getOutputPath()
				+creq.getPath()
				+".pdf" ;
	}

	private String getLogFilename( final Chart creq ) {
		return getOutputPath()
				+creq.getPath()
				+".log" ;
	}

	private String getErrFilename( final Chart creq ) {
		return getOutputPath()
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

	private String getOutputPath() {
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
