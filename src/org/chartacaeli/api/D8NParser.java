
package org.chartacaeli.api;

import java.io.IOException;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.net.URL;

import javax.servlet.ServletContext;
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

	// web.xml
	private final String CF_XSDLOC = ".schemaLocation" ;

	private DocumentBuilderFactory dactory = DocumentBuilderFactory.newInstance() ;

	private SchemaFactory sactory = SchemaFactory.newInstance( XMLConstants.W3C_XML_SCHEMA_NS_URI ) ;

	public D8NParser( final ServletContext context ) throws MalformedURLException, SAXException {
		String xsdkey ;
		String xsdloc ;
		URL xsdurl ;
		Schema xsd ;

		xsdkey = this.getClass().getName()+CF_XSDLOC ;
		xsdloc = context.getInitParameter( xsdkey ) ;

		xsdurl = new URL( xsdloc ) ;
		xsd = sactory.newSchema( xsdurl ) ;

		dactory.setSchema( xsd ) ;
		dactory.setValidating( false ) ;
		dactory.setNamespaceAware( true ) ;
	}

	@Override
	public Document parse( final String xml ) throws SAXException, ParserConfigurationException, IOException {
		DocumentBuilder builder ;

		builder = dactory.newDocumentBuilder() ;
		builder.setErrorHandler( new XMLErrorHandler() ) ;

		return builder.parse( new InputSource( new StringReader( xml ) ) ) ;
	}
}
