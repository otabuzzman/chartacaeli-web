
package org.chartacaeli.api;

import java.io.IOException;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.net.URL;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;

import org.w3c.dom.Document;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

public class D8NParser implements XMLParser {

	private DocumentBuilderFactory dactory = DocumentBuilderFactory.newInstance() ;

	private SchemaFactory sactory = SchemaFactory.newInstance( XMLConstants.W3C_XML_SCHEMA_NS_URI ) ;

	public D8NParser( final String xsdloc ) throws MalformedURLException, SAXException {
		URL xsdurl ;
		Schema xsd ;

		xsdurl = new URL( xsdloc ) ;
		xsd = sactory.newSchema( xsdurl ) ;

		dactory.setSchema( xsd ) ;
		dactory.setValidating( false ) ;
		dactory.setNamespaceAware( true ) ;
	}

	@Override
	public Document parse( final String xml ) throws /*MalformedURLException*/ SAXException, ParserConfigurationException, IOException {
		DocumentBuilder builder ;

		builder = dactory.newDocumentBuilder() ;
		builder.setErrorHandler( new XMLErrorHandler() ) ;

		return builder.parse( new InputSource( new StringReader( xml ) ) ) ;
	}
}
