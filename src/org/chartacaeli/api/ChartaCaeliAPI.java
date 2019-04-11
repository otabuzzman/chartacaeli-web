
package org.chartacaeli.api;

import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;

@Path("/")
public class ChartaCaeliAPI {

	@Path( "/exec" ) @POST
	public Response exec(
			@FormParam( "chart")  String chart,
			@FormParam( "prefs" ) String prefs) {
		return Response.status( 200 )
				.entity( chart.substring( 0, 50 )+"...\n"+prefs.substring( 0 , 50 )+"...\n" )
				.build() ;
	}

	// sync:
	// exec, post defn[/ pref] in mulitipart body, return pdf
	// async:
	// exec, post defn[/ pref] in mulitipart body, return id
	// stat, id in query param, return true/ false
	// take, id in query param, return pdf
	// wipe, id in query param

}
