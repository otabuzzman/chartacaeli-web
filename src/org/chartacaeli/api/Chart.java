
package org.chartacaeli.api;

import java.util.Arrays;
import java.util.List;

import javax.persistence.Access;
import javax.persistence.AccessType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;

@NamedQueries({
	@NamedQuery( name = "Chart.findAll", query = "SELECT x FROM Chart x" ),
	@NamedQuery( name = "Chart.findById", query = "SELECT x FROM Chart x WHERE x.id = :id" )
})

@Entity
@Table( name = "CHARTS" )
@XmlRootElement( name = "chart" )
@XmlAccessorType( XmlAccessType.FIELD )
public class Chart {

	public final static int ST_NONE		= 0 ;
	public final static int ST_RECEIVED	= 1 ;
	public final static int ST_ACCEPTED	= 2 ;
	public final static int ST_REJECTED	= 3 ;
	public final static int ST_STARTED	= 4 ;
	public final static int ST_FINISHED	= 5 ;
	public final static int ST_FAILED	= 6 ;
	public final static int ST_CLEANED	= 7 ;

	private static List<String> status =
			Arrays.asList( new String[] {
					"none",
					"received",
					"accepted",
					"rejected",
					"started",
					"finished",
					"failed",
					"cleaned"
			}) ;

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
	@Access( AccessType.PROPERTY )
	@XmlTransient
	private int statNum ;

	@Transient
	@XmlElement ( name = "stat" )
	private String statNam ;

	@Transient
	@XmlElement
	private String info ;

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

	public int getStatNum() {
		return statNum ;
	}

	public void setStatNum( int statNum ) {
		int stat = Math.abs( statNum )%status.size() ;

		this.statNum = stat ;
		this.statNam = status.get( stat ) ;
	}

	public String getStatNam() {
		return statNam ;
	}

	public void setStatNam( String statNam ) {
		int stat = status.indexOf( statNam ) ;

		if ( stat == -1 ) {
			this.statNam = status.get( ST_NONE ) ;
			this.statNum = ST_NONE ;
		} else {
			this.statNam = status.get( stat ) ;
			this.statNum = stat ;
		}
	}

	public String getInfo() {
		return info ;
	}

	public void setInfo( String info ) {
		this.info = info ;
	}

	public String getPath() {
		return "/"+getId()+"/"+getName() ;
	}
}
