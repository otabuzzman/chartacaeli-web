
package org.chartacaeli.api;

import java.io.IOException;
import java.io.StringReader;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

public class P9SParser implements XMLParser {

	private DocumentBuilderFactory dactory = DocumentBuilderFactory.newInstance() ;

	public P9SParser() {
		dactory.setValidating( true ) ;
	}

	@Override
	public Document parse( final String xml ) throws SAXException, ParserConfigurationException, IOException {
		DocumentBuilder builder ;

		builder = dactory.newDocumentBuilder() ;
		builder.setErrorHandler( new XMLErrorHandler() ) ;

		return builder.parse( new InputSource( new StringReader( xml ) ) ) ;
	}
}
