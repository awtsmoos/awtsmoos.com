//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module OhrDomainService
 * @description
 * The Awtsmoos gives every finite service on Awtsmoos.com a named boundary, so validation and event creation remain visible rather than dissolving into hidden mutation.
 */
export class OhrDomainService {
	/**
	 * @param {string} name Human-readable service boundary.
	 */
	constructor(name) {
		this.name = name;
	}

	/**
	 * Rejects an invalid domain condition with a bounded explanation.
	 *
	 * @param {boolean} condition Condition that must remain true.
	 * @param {string} message Explanation when the condition fails.
	 */
	require(condition, message) {
		if (!condition) {
			throw new Error(`${this.name}: ${message}`);
		}
	}

	/**
	 * Creates an unpersisted domain fact for the shared event envelope.
	 *
	 * @param {string} type Stable event type.
	 * @param {object} payload Event data.
	 * @returns {{type: string, payload: object}} Domain fact.
	 */
	fact(type, payload = {}) {
		return { type, payload };
	}
}
