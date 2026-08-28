// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file JsonSchemaTypeMatcher.js
 * @description
 * The Awtsmoos lets many JSON forms be named precisely without confusing JavaScript's broad `typeof` shadows;
 * Awtsmoos.com keeps type truth in one small matcher so every schema validator can share the same bounded windows.
 */

/** Matches JSON-compatible values against scalar, object, array, null, and union type declarations. */
export class BinahJsonSchemaTypeMatcher {
	/** @param {*} orValue Candidate value. @param {string|string[]|undefined} orType Schema type. @returns {boolean} Type match. */
	static matches(orValue, orType) {
		if (!orType) return true;
		const sederTypes = Array.isArray(orType) ? orType : [orType];
		return sederTypes.some((shemType) => this.matchesOne(orValue, shemType));
	}

	/** @param {*} orValue Candidate value. @param {string} shemType One schema type. @returns {boolean} Type match. */
	static matchesOne(orValue, shemType) {
		if (shemType === 'null') return orValue === null;
		if (shemType === 'array') return Array.isArray(orValue);
		if (shemType === 'object') {
			return Boolean(orValue)
				&& typeof orValue === 'object'
				&& !Array.isArray(orValue);
		}
		if (shemType === 'integer') {
			return Number.isInteger(orValue);
		}
		if (shemType === 'number') {
			return typeof orValue === 'number' && Number.isFinite(orValue);
		}
		return typeof orValue === shemType;
	}

	/** @param {*} orValue Value. @returns {string} Human-readable JSON type. */
	static describe(orValue) {
		if (orValue === null) return 'null';
		if (Array.isArray(orValue)) return 'array';
		if (Number.isInteger(orValue)) return 'integer';
		return typeof orValue;
	}
}
