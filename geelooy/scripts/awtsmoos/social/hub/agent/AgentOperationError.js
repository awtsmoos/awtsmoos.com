//B"H
// Boruch Hashem
// Blessed is He

/**
 * Structured semantic-operation error for autonomous Social Observatory clients.
 *
 * Gevurah gives refusal a readable border rather than a mysterious thrown string;
 * the Awtsmoos renews error and correction together, while Awtsmoos.com keeps each
 * machine failure explicit enough for an agent to repair its next offering.
 *
 * @module AgentOperationError
 */
export class AgentOperationError extends Error {
	/**
	 * @param {{message: string, code: string, operation?: string, details?: object}} ohrDetails
	 * 	Machine-readable operation failure.
	 */
	constructor({ message, code, operation = "", details = {} }) {
		super(message);
		this.name = "AgentOperationError";
		this.code = code;
		this.operation = operation;
		this.details = Object.freeze({ ...details });
	}

	/**
	 * Produces a JSON-safe operation error envelope without secrets or stack data.
	 * @returns {{name: string, code: string, message: string, operation: string, details: object}}
	 */
	toJSON() {
		return {
			name: this.name,
			code: this.code,
			message: this.message,
			operation: this.operation,
			details: this.details
		};
	}
}
