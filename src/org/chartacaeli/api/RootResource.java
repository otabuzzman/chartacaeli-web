
package org.chartacaeli.api;

import javax.servlet.ServletContext;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Link;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

@Path( "/" )
public class RootResource {

	@GET
	public Response getRoot( @Context UriInfo uri, @Context ServletContext context ) {
		Link self, neew ;

		self = Link.fromUri( uri.getAbsolutePath() ).rel( "self" ).build() ;
		neew = Link.fromUri( uri.getAbsolutePath()+"/charts" ).rel( "new" ).build() ;

		return Response.status( Response.Status.OK )
				.links( self, neew )
				.entity( context.getServletContextName() )
				.build() ;
	}
}
