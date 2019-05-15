
package org.chartacaeli.api;

import java.util.UUID;

import javax.ws.rs.core.Link;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

@XmlRootElement( name = "chart" )
@XmlAccessorType( XmlAccessType.FIELD )
public class Chart {

	@XmlAttribute
	private String id ;

	@XmlElement
	private String stat ;

	@XmlJavaTypeAdapter( Link.JaxbAdapter.class )
	@XmlElement
	private Link link ;

	public String getId() {
		return id ;
	}

	public void setId( String id ) {
		this.id = id ;
	}

	public void setId( UUID id ) {
		this.id = id.toString() ;
	}

	public String getStat() {
		return stat ;
	}

	public void setStat( String stat ) {
		this.stat = stat ;
	}

	public Link getLink() {
		return link ;
	}

	public void setLink( Link link ) {
		this.link = link ;
	}
}
