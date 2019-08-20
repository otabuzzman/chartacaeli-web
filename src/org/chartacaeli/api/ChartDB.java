package org.chartacaeli.api;

import java.util.List;
import java.util.Optional;

import javax.persistence.EntityManager;

public class ChartDB implements DAO<Chart> {

	@Override
	public Optional<Chart> findById( String id ) {
		EntityManager em ;
		Optional<Chart> chart ;

		em = ServletContextListener.createEntityManager() ;
		try {
			chart = Optional.ofNullable( em
					.createNamedQuery( "Chart.findById", Chart.class )
					.setParameter( "id", id )
					.getSingleResult() ) ;
		} catch ( Exception e ) {
			chart = Optional.ofNullable( null ) ;
		}
		em.close() ;

		return chart ;
	}

	@Override
	public List<Chart> findAll() {
		EntityManager em ;
		List<Chart> list ;

		em = ServletContextListener.createEntityManager() ;
		list = em.createNamedQuery( "Chart.findAll", Chart.class )
				.getResultList() ;
		em.close() ;

		return list ;
	}

	@Override
	public void insert( Chart chart ) {
		EntityManager em ;

		em = ServletContextListener.createEntityManager() ;

		em.getTransaction().begin() ;
		em.persist( chart ) ;
		em.getTransaction().commit() ;

		em.close() ;
	}

	@Override
	public void update( Chart chart ) {
		EntityManager em ;

		em = ServletContextListener.createEntityManager() ;

		em.getTransaction().begin() ;
		em.merge( chart ) ;
		em.getTransaction().commit() ;

		em.close() ;
	}

	@Override
	public void delete( Chart chart ) {
		EntityManager em ;

		em = ServletContextListener.createEntityManager() ;

		em.getTransaction().begin() ;
		em.remove( chart ) ;
		em.getTransaction().commit() ;

		em.close() ;
	}
}
