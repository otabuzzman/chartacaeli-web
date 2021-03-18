
package org.chartacaeli.api;

import java.io.IOException;
import java.io.StringReader;
import java.nio.file.Files;
import java.nio.file.Paths;

import javax.servlet.ServletContext;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

public class P9SParser implements XMLParser {

	private DocumentBuilderFactory dactory = DocumentBuilderFactory.newInstance() ;

	public P9SParser( ServletContext context ) {
		dactory.setValidating( true ) ;
	}

	@Override
	public Document parse( final String xml ) throws SAXException, ParserConfigurationException, IOException {
		DocumentBuilder builder ;

		builder = dactory.newDocumentBuilder() ;
		builder.setErrorHandler( new XMLErrorHandler() ) ;
		builder.setEntityResolver( new RedirectResolver() ) ;

		return builder.parse( new InputSource( new StringReader( xml ) ) ) ;
	}

	public static void main( String[] argv ) {
		try {
			String prefs = new String( Files.readAllBytes( Paths.get( argv[0] ) ) ) ;
			System.out.print( prefs.subSequence( 0, 200 ) ) ;

			new P9SParser( null ).parse( prefs ) ;
		} catch (Exception e) {
			e.printStackTrace() ;
		}
	}
}
