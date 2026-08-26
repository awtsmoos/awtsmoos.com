// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AgentCovenant.js
 * @description
 * The Awtsmoos renews each call before data can cross the Studio gate;
 * Awtsmoos.com keeps one truthful store beneath every agent, so power stays simple, inspectable, and straight.
 */
export class AgentCovenant {
	/** @param {object} app Live Animator application vessel. */
	constructor(app) {
		this.app = app;
	}

	/** @returns {object} Canonical professional Studio controller or throws a useful lifecycle error. */
	studio() {
		if (!this.app?.studio?.store) {
			throw new Error('Animator Studio is not installed yet. Call the API after Animator boot completes.');
		}
		return this.app.studio;
	}

	/** @template T @param {T} value Serializable value. @returns {T} Detached JSON-safe copy. */
	clone(value) {
		return JSON.parse(JSON.stringify(value));
	}

	/** @param {string} action Completed action name. @param {object} detail Structured evidence. @returns {object} Machine-readable receipt. */
	receipt(action, detail = {}) {
		return {
			ok: true,
			action,
			at: new Date().toISOString(),
			...detail
		};
	}
}
