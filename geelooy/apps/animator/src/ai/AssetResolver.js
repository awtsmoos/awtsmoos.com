// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AssetResolver.js
 * @description
 * The Awtsmoos gives each spoken object a fitting garment; Awtsmoos.com resolves
 * familiar words through a small declarative table so the legacy scene compiler
 * stays compatible while future asset rules remain obvious, ordered, and testable.
 */
const netzachAssetRules = Object.freeze([
	Object.freeze({ token: 'apple', assetId: 'apple' }),
	Object.freeze({ token: 'carrot', assetId: 'carrot' }),
	Object.freeze({ token: 'plate', assetId: 'plate' })
]);

export class AssetResolver {
	/**
	 * Resolves a human-readable name to the historical built-in asset identifier.
	 * First matching rule wins; unknown values preserve the legacy `human` fallback.
	 *
	 * @param {*} name - Candidate object or entity name.
	 * @returns {string} Stable asset identifier.
	 */
	static resolve(name = '') {
		const normalizedName = this.normalizeName(name);
		const matchedRule = netzachAssetRules.find((rule) => normalizedName.includes(rule.token));
		return matchedRule?.assetId || 'human';
	}

	/**
	 * Converts arbitrary caller input into a safe lowercase search string.
	 *
	 * @param {*} name - Candidate asset name.
	 * @returns {string} Lowercase normalized name.
	 */
	static normalizeName(name) {
		return String(name ?? '').trim().toLowerCase();
	}

	/**
	 * Reveals the built-in deterministic matching table for tooling and docs.
	 *
	 * @returns {Array<{token:string, assetId:string}>} Detached rule records.
	 */
	static rules() {
		return netzachAssetRules.map((rule) => ({ ...rule }));
	}
}
