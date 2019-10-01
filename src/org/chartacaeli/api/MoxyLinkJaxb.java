
package org.chartacaeli.api;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAnyAttribute;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.namespace.QName;

// MOXy workaround (SO #24968448)
@XmlAccessorType( XmlAccessType.FIELD )
public class MoxyLinkJaxb {

	@XmlAttribute( name = "href" )
	private URI uri ;

	@XmlAnyAttribute
	private Map<QName, Object> params ;


	public MoxyLinkJaxb() {
		this ( null, null ) ;
	}

	public MoxyLinkJaxb( URI uri ) {
		this( uri, null ) ;
	}

	public MoxyLinkJaxb( URI uri, Map<QName, Object> map ) {
		this.uri = uri ;
		this.params = map!=null ? map : new HashMap<QName, Object>() ;
	}  

	public URI getUri() {
		return uri ;
	}  

	public Map<QName, Object> getParams() {
		return params ;
	}

	public void setUri( URI uri ) {
		this.uri = uri ;
	}  

	public void setParams( Map<QName, Object> params ) {
		this.params = params ;
	}
}
