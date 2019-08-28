
package org.chartacaeli.api;

import javax.ws.rs.core.Response;

public class SuccessResult extends CompositeResult {

	protected SuccessResult() {
		super(Status.OK, Response.Status.OK, "" ) ;
	}

	protected SuccessResult( String message ) {
		super(Status.OK, Response.Status.OK, message == null ? "" : message ) ;
	}
}
