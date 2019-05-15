
package org.chartacaeli.api;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Link;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

@Path("/")
public class ChartaCaeli {

	private static Map<String, Chart> charts = new ConcurrentHashMap<String, Chart>() ;

	@Context
	UriInfo uri ;

	@POST
	@Path( "/charts" )
	public Response charts(
			@FormParam( "chart")  String chart,
			@FormParam( "prefs" ) String prefs ) {
		String id ;
		Chart cdef ;

		id = UUID.randomUUID().toString() ;

		cdef = new Chart() ;
		cdef.setId( id ) ;
		charts.put( id, cdef ) ;

		return Response.status( Response.Status.ACCEPTED )
				.location( uri.getBaseUriBuilder().path( "states" ).path( id ).build() )
				.build() ;
	}

	@GET
	@Path( "/states/{id}" )
	public Response states(
			@PathParam( value = "id" ) String id ) {
		Chart cdef ;
		Link self ;

		cdef = charts.get( id ) ;
		self = Link.fromUri( uri.getPath()+"/"+id ).rel( "self" ).build() ;
		cdef.setLink( self ) ;

		return Response.status( Response.Status.OK )
				.entity( cdef )
				.build() ;
	}
}
