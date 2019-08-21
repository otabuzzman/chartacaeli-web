
package org.chartacaeli.api;

public abstract class CompositeResult {

	public enum Status {
		OK,
		NOTOK
	}

	private final Status status ;
	private final String message ;

	protected CompositeResult( Status status, String message ) {
		this.status = status ;
		this.message = message ;
	}

	public boolean ok() {
		return status == Status.OK ;
	}

	public String message() {
		return message ;
	}
}
