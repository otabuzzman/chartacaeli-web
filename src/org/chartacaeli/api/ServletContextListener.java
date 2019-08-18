
package org.chartacaeli.api;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.servlet.ServletContextEvent;
import javax.servlet.annotation.WebListener;

@WebListener
public class ServletContextListener implements javax.servlet.ServletContextListener {

	private static EntityManagerFactory factory ;

	@Override
	public void contextInitialized(ServletContextEvent arg0) {
		factory = Persistence.createEntityManagerFactory( "ChartDB" ) ;
	}

	@Override
	public void contextDestroyed(ServletContextEvent arg0) {
		if ( factory != null )
			factory.close() ;
	}

	public static EntityManager createEntityManager() {
		if ( factory == null )
			throw new IllegalStateException() ;

		return factory.createEntityManager() ;
	}
}
