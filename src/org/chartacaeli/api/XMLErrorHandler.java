
package org.chartacaeli.api;

import org.xml.sax.ErrorHandler;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;

public class XMLErrorHandler implements ErrorHandler {

	@Override
	public void warning( SAXParseException e ) throws SAXException {
		throw new SAXException( e ) ;
	}

	@Override
	public void fatalError( SAXParseException e ) throws SAXException {
		throw new SAXException( e ) ;
	}

	@Override
	public void error( SAXParseException e ) throws SAXException {
		throw new SAXException( e ) ;
	}
}
