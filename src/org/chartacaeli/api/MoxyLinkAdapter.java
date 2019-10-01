
package org.chartacaeli.api;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.core.Link;
import javax.xml.bind.annotation.adapters.XmlAdapter;
import javax.xml.namespace.QName;

// MOXy workaround (SO #24968448)
public class MoxyLinkAdapter extends XmlAdapter<MoxyLinkJaxb, Link> {

	public MoxyLinkAdapter() {
	}

	@Override
	public Link unmarshal( MoxyLinkJaxb link ) throws Exception {
		Link.Builder builder ;

		builder = Link.fromUri( link.getUri() ) ;

		for ( Map.Entry<QName, Object> entry : link.getParams().entrySet() )
			builder.param( entry.getKey().getLocalPart(), entry.getValue().toString() ) ;

		return builder.build() ;
	}

	@Override
	public MoxyLinkJaxb marshal( Link link ) throws Exception {
		Map<QName, Object> params ;

		params = new HashMap<>() ;

		for ( Map.Entry<String,String> entry : link.getParams().entrySet() )
			params.put( new QName( "", entry.getKey() ), entry.getValue() ) ;

		return new MoxyLinkJaxb( link.getUri(), params ) ;
	}
}
