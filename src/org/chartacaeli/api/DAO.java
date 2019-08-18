
package org.chartacaeli.api;

import java.util.List;
import java.util.Optional;

public interface DAO<T> {

	public Optional<T> findById( String id ) ;
	public List<T> findAll() ;
	public void insert( T t ) ;
	public void update( T t ) ;
	public void delete( T t ) ;
}
