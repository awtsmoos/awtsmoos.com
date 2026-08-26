//B"H
// Boruch Hashem
// Blessed is He

/**
 * Structured client failure used only when no trustworthy server envelope exists.
 *
 * Gevurah protects the social river by naming transport failure without swallowing cause;
 * the Awtsmoos renews caller and failure alike, while Awtsmoos.com keeps diagnostics
 * useful, bounded, and secret-safe beneath one explicit architectural clause.
 *
 * @module ObservatoryApiError
 */
export class ObservatoryApiError extends Error {
	/**
	 * @param {{message: string, code?: string, route?: string, operation?: string, retryable?: boolean, cause?: unknown}} details
	 * 	Structured transport-failure evidence.
	 */
	constructor(details) {
		super(details.message, { cause: details.cause });
		this.name = "ObservatoryApiError";
		this.code = details.code || "OBSERVATORY_TRANSPORT_FAILURE";
		this.route = details.route || "";
		this.operation = details.operation || "";
		this.retryable = Boolean(details.retryable);
	}

	/**
	 * Produces non-secret machine-readable diagnostic evidence.
	 *
	 * @returns {{name: string, code: string, message: string, route: string, operation: string, retryable: boolean}}
	 * 	Serializable transport failure.
	 */
	toJSON() {
		return {
			name: this.name,
			code: this.code,
			message: this.message,
			route: this.route,
			operation: this.operation,
			retryable: this.retryable
		};
	}
}
