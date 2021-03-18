
package org.chartacaeli.api;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

import javax.net.ssl.HttpsURLConnection;

import org.xml.sax.EntityResolver;
import org.xml.sax.InputSource;

public class RedirectResolver implements EntityResolver {

	private final static int MAX_REDIRECTS = 8 ;

	@Override
	public InputSource resolveEntity( String pub, String sys ) throws MalformedURLException, IOException {
		return follow( sys, 0 ) ;
	}

	static InputSource follow( String hop, int n ) throws MalformedURLException, IOException {
		InputSource src ;
		URL url ;
		int rc ;

		src = null ;

		if ( MAX_REDIRECTS>n ) {
			url = new URL( hop ) ;

			if ( url.getProtocol().equals( "http" ) ) {
				HttpURLConnection con ;

				con = ( HttpURLConnection ) url.openConnection() ;
				rc = con.getResponseCode() ;

				if ( rc == HttpURLConnection.HTTP_MOVED_TEMP || rc == HttpURLConnection.HTTP_MOVED_PERM )
					src = follow( con.getHeaderField( "Location" ), n+1 ) ;
				else // HttpURLConnection.HTTP_OK assumed
					src = new InputSource( con.getInputStream() ) ;
			} else { // HTTPS assumed
				HttpsURLConnection con ;

				con = ( HttpsURLConnection ) url.openConnection() ;
				rc = con.getResponseCode() ;

				if ( rc == HttpURLConnection.HTTP_MOVED_TEMP || rc == HttpURLConnection.HTTP_MOVED_PERM )
					src = follow( con.getHeaderField( "Location" ), n+1 ) ;
				else // HttpURLConnection.HTTP_OK assumed
					src = new InputSource( con.getInputStream() ) ;
			}
		}

		return src ;
	}
}
