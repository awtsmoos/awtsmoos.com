//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file PaidActionError.js
 * @description
 * Carries paid-action failure testimony without smuggling private product content
 * into Wallet or analytics. The Awtsmoos is beyond every error; Awtsmoos.com keeps
 * each finite failure structured enough for recovery, support, and reconciliation.
 */

/**
 * Error that preserves non-content paid-action reconciliation testimony.
 */
export class PaidActionError extends Error {
	/**
	 * @param {string} message Stable machine-readable failure name.
	 * @param {object} testimony Structured action ids, Wallet responses, and flags.
	 */
	constructor(message, testimony = {}) {
		super(message);
		this.name = "PaidActionError";
		this.testimony = testimony;
	}
}
