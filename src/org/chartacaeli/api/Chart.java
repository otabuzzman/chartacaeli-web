
package org.chartacaeli.api;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.ws.rs.core.Link;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

@NamedQueries({
	@NamedQuery( name = "Chart.findAll", query = "SELECT x FROM Chart x" ),
	@NamedQuery( name = "Chart.findById", query = "SELECT x FROM Chart x WHERE x.id = :id" )
})

@Entity
@Table( name = "CHARTS" )
@XmlRootElement( name = "chart" )
@XmlAccessorType( XmlAccessType.FIELD )
public class Chart {

	public enum State {
		none,
		received,
		accepted,
		rejected,
		started,
		finished,
		failed,
		cleaned
	} ;

	@Id
	@Column( name = "ID", unique = true )
	@XmlAttribute
	private String id ;

	@Column( name = "CREATED", nullable = false )
	@XmlElement
	private long created ;

	@Column( name = "MODIFIED", nullable = false )
	@XmlElement
	private long modified ;

	@Column( name = "NAME", nullable = false )
	@XmlElement
	private String name ;

	@Column( name = "STAT", nullable = false )
	@XmlTransient
	@Enumerated( EnumType.STRING )
	private State statNum ;

	@Transient
	@XmlElement( name = "stat" )
	private String statNam ;

	@Transient
	@XmlElement
	private String info ;

	@Transient
	@XmlJavaTypeAdapter( MoxyLinkAdapter.class )
	private List<Link> hateoas ;

	public Chart() {
	}

	public String getId() {
		return id ;
	}

	public void setId( String id ) {
		this.id = id ;
	}

	public long getCreated() {
		return created ;
	}

	public void setCreated( long created ) {
		this.created = created ;
	}

	public long getModified() {
		return modified ;
	}

	public void setModified( long modified ) {
		this.modified = modified ;
	}

	public String getName() {
		return name ;
	}

	public void setName( String name ) {
		this.name = name ;
	}

	public State getStatNum() {
		return statNum ;
	}

	public void setStatNum( State stat ) {
		this.statNum = stat ;
		this.statNam = stat.name() ;
	}

	public String getStatNam() {
		return statNam ;
	}

	public void setStatNam( String name ) {
		this.statNum = State.valueOf( name ) ;
		this.statNam = name ;
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
