
package org.chartacaeli.api;

import java.io.IOException;
import java.io.StringReader;
import java.net.URI;
import java.util.Optional;
import java.util.UUID;

import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Link;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

@Path( "/charts" )
public class ChartsResource {

	@Context
	private UriInfo uri ;

	private ChartDB chartDB = new ChartDB() ;

	@POST
	public Response charts(
			@FormParam( "chart")  String chart,
			@FormParam( "prefs" ) String prefs ) {
		Chart creq ;
		String cnam ;
		Link self, next ;
		URI nextURI ;

		creq = new Chart() ;
		creq.setId( UUID.randomUUID().toString() ) ;
		creq.setCreated( System.currentTimeMillis() ) ;
		creq.setStatNum( Chart.ST_RECEIVED ) ;

		if ( validateD8N( chart, creq ) == false ) {
			creq.setStatNum( Chart.ST_REJECTED ) ;

			return Response.status( Response.Status.BAD_REQUEST )
					.entity( creq )
					.build() ;
		}
		if ( validateP9S( prefs, creq ) == false ) {
			creq.setStatNum( Chart.ST_REJECTED ) ;

			return Response.status( Response.Status.BAD_REQUEST )
					.entity( creq )
					.build() ;
		}

		try {
			cnam = getChartName( chart ) ;
		} catch ( Exception e ) {
			creq.setInfo( e.getMessage() ) ;

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
			throw new Exception( e.getMessage() ) ;
		}

		return name ;
	}

	private boolean validateD8N( final String chart, final Chart creq ) {
		return true ;
	}

	private boolean validateP9S( final String prefs, final Chart creq ) {

		if ( prefs == null )
			return true ;

		return true ;
	}
}
