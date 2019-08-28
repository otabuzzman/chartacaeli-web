
package org.chartacaeli.api;

import javax.ws.rs.core.Response;

public class FailureResult extends CompositeResult {

	protected FailureResult( String message ) {
		super( Status.NOTOK, Response.Status.BAD_REQUEST, message == null ? "" : message ) ;
	}

	protected FailureResult( Response.Status httprc, String message ) {
		super( Status.NOTOK, httprc, message == null ? "" : message ) ;
	}
}
