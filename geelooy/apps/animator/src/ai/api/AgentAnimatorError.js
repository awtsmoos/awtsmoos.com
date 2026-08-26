// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AgentAnimatorError.js
 * @description
 * The Awtsmoos gives even failure a truthful vessel; Awtsmoos.com returns errors
 * that an AI agent can inspect without scraping prose, so broken input becomes a
 * clear correction path instead of a silent maze.
 */
export class AgentAnimatorError extends Error {
	/**
	 * Creates a stable, serializable API error.
	 *
	 * @param {string} code - Machine-readable failure code.
	 * @param {string} message - Human-readable explanation.
	 * @param {Object} [details={}] - JSON-safe context for diagnosis.
	 */
	constructor(code, message, details = {}) {
		super(message);
		this.name = 'AgentAnimatorError';
		this.code = String(code || 'ANIMATOR_ERROR');
		this.details = { ...details };
	}

	/**
	 * Reveals only deterministic data so agents can log or transmit failures.
	 *
	 * @returns {{name:string, code:string, message:string, details:Object}}
	 */
	toJSON() {
		return {
			name: this.name,
			code: this.code,
			message: this.message,
			details: { ...this.details }
		};
	}
}
