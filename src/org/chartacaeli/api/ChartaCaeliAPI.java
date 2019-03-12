
package org.chartacaeli.api;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/")
public class ChartaCaeliAPI {

	@Path( "/make" )
	@GET @Produces( MediaType.TEXT_PLAIN ) 
	public String definition() {
		return( "null" ) ;
	}
	
	// sync:
	// make, post defn[/ pref] in mulitipart body, return pdf
	// async:
	// make, post defn[/ pref] in mulitipart body, return id
	// stat, id in query param, return true/ false
	// take, id in query param, return pdf
	// wipe, id in query param
	
}
