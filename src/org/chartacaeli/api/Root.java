
package org.chartacaeli.api;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.Transient;
import javax.ws.rs.core.Link;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

@XmlRootElement( name = "root" )
@XmlAccessorType( XmlAccessType.FIELD )
public class Root {

	@Transient
	@XmlElement
	private String info ;

	@Transient
	@XmlJavaTypeAdapter( MoxyLinkAdapter.class )
	private List<Link> hateoas ;

	public Root() {
	}

	public String getInfo() {
		return info ;
	}

	public void setInfo( String info ) {
		this.info = info ;
	}

	public List<Link> getHateoas() {
		return hateoas ;
	}

	public void setHateoas( Link link ) {
		if ( hateoas == null )
			hateoas = new ArrayList<Link>() ;

		hateoas.add( link ) ;
	}
}
