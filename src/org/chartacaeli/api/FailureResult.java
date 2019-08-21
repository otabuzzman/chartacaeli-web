
package org.chartacaeli.api;

public class FailureResult extends CompositeResult {

	protected FailureResult( String message ) {
		super( Status.NOTOK, message == null ? "" : message ) ;
	}
}
