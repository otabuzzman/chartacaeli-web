
package org.chartacaeli.api;

import javax.ws.rs.ApplicationPath;

@ApplicationPath( "/api/*" )
public class ResourceConfig extends org.glassfish.jersey.server.ResourceConfig {

	public ResourceConfig() {
		packages( RootResource.class.getPackage().getName() ) ;
	}
}
