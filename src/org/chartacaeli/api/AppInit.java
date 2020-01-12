
package org.chartacaeli.api;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.servlet.ServletContextEvent;
import javax.servlet.annotation.WebListener;

@WebListener
public class AppInit implements javax.servlet.ServletContextListener {

	private static EntityManagerFactory factory ;

	@Override
	public void contextInitialized( ServletContextEvent event ) {
		factory = Persistence.createEntityManagerFactory( "ChartDB" ) ;
	}

	@Override
	public void contextDestroyed( ServletContextEvent event ) {
		if ( factory != null )
			factory.close() ;
	}

	public static EntityManager createEntityManager() {
		if ( factory == null )
			throw new IllegalStateException() ;

		return factory.createEntityManager() ;
	}
}
