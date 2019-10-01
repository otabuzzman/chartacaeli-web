
package org.chartacaeli.api;

import java.io.IOException;

import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.xml.sax.SAXException;

public interface XMLParser {
	public Document parse( final String xml ) throws SAXException, ParserConfigurationException, IOException ;
}
