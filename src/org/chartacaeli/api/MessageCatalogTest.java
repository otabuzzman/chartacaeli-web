
package org.chartacaeli.api;

import static org.junit.Assert.*;

import org.junit.Test;

public class MessageCatalogTest {

	private final static String ML_CLASS      = "junitc" ;
	private final static String ML_PACKAGE    = "junitp" ;
	private final static String ML_SUPERCLASS = "junits" ;
	private final static String ML_NONE       = "junitn" ;

	@Test
	public void testGetMessage() {
		String[] exp = new String[] {
				"Klasse",
				"Paket",
				"Superklasse",
				"no message available"
		} ;
		String[] act = new String[] {
				MessageCatalog.getMessage( this.getClass(), ML_CLASS, null ),
				MessageCatalog.getMessage( this.getClass(), ML_PACKAGE, null ),
				MessageCatalog.getMessage( this.getClass(), ML_SUPERCLASS, null ),
				MessageCatalog.getMessage( this.getClass(), ML_NONE, null )
		} ;

		for ( String v : act )
			System.err.println( v ) ;

		assertArrayEquals( exp,  act ) ;
	}
}
