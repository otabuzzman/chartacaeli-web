
package org.chartacaeli.api;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

public class MessageCatalog {

	private final static ResourceBundle bundle = ResourceBundle.getBundle(
			"chartacaeli-web",
			Locale.getDefault(),
			Thread.currentThread().getContextClassLoader() ) ;

	private final static String DEFAULT_MESSAGE = "no message available" ;

	public static String getMessage( Object clazz, String key, Object[] arg ) {
		return getMessage( clazz.getClass(), key, arg ) ;
	}

	public static String getMessage( Class<?> clazz, String key, Object[] arg ) {
		String k, v ;

		if ( clazz == null )
			return DEFAULT_MESSAGE ;
		if ( key == null || key.isEmpty() )
			return DEFAULT_MESSAGE ;

		k = clazz.getName()+".message."+key ;

		if ( ! bundle.containsKey( k ) ) {
			k = clazz.getPackage().getName()+".message."+key ;

			if ( ! bundle.containsKey( k ) )
				return getMessage( clazz.getSuperclass(), key, arg ) ;
		}

		try {
			v = bundle.getString( k ) ;
		} catch ( MissingResourceException e ) {
			return DEFAULT_MESSAGE ;
		}

		if ( arg == null )
			return v ;

		return MessageFormat.format( v, arg ) ;
	}
}
