
package org.chartacaeli.api;

import javax.ws.rs.core.Response;

public abstract class CompositeResult {

	public enum Status {
		OK,
		NOTOK
	}

	private final Status status ;
	private final Response.Status httprc ;
	private final String message ;

	protected CompositeResult( Status status, Response.Status httprc, String message ) {
		this.status = status ;
		this.httprc = httprc ;
		this.message = message ;
	}

	public boolean ok() {
		return status == Status.OK ;
	}

	public Response.Status getRC() {
		return httprc ;
	}

	public String message() {
		return message ;
	}
}
