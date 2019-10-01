
package org.chartacaeli.api;

import javax.servlet.ServletContext;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Link;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

@Path( "/" )
public class RootResource {

	@GET
	@Produces( {
		MediaType.APPLICATION_JSON,
		MediaType.APPLICATION_XML } )
	public Response getRoot(
			@HeaderParam( "Accept" ) String accept,
			@Context UriInfo uri,
			@Context ServletContext context ) {
		String type ;
		Root root ;
		Link self, neew ;

		if ( accept.equals( MediaType.APPLICATION_XML ) )
			type = MediaType.APPLICATION_XML ;
		else
			type = MediaType.APPLICATION_JSON ;

		root = new Root() ;
		root.setInfo( context.getServletContextName() ) ;

		self = Link.fromUri( uri.getAbsolutePath() ).rel( "self" ).build() ;
		neew = Link.fromUri( uri.getAbsolutePath()+"/charts" ).rel( "new" ).build() ;

		root.setHateoas( self ) ;
		root.setHateoas( neew ) ;

		return Response.status( Response.Status.OK )
				.links( self, neew )
				.type( type )
				.entity( root )
				.build() ;
	}
}
