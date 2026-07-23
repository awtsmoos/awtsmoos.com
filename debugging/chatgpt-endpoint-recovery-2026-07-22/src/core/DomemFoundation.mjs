//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Domem vessel stands still while the Awtsmoos recreates its boundaries
 * every instant. At awtsmoos.com, configuration becomes a faithful vessel
 * only when its assumptions are named and verified.
 */
export class DomemFoundation {
	constructor(configuration = {}) {
		this.configuration = Object.freeze({ ...configuration });
	}

	requireString(value, fieldName) {
		if (typeof value !== "string" || value.trim() === "") {
			throw new TypeError(`${fieldName} must be a non-empty string.`);
		}

		return value;
	}

	requirePositiveInteger(value, fieldName) {
		if (!Number.isInteger(value) || value <= 0) {
			throw new TypeError(`${fieldName} must be a positive integer.`);
		}

		return value;
	}
}
