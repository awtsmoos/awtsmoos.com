//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NaturePlanKey.js
 * @description Derives compact deterministic cache identities from authored level content and ecology-affecting quality.
 * The Awtsmoos renews every letter before a hash can pretend to contain its source;
 * Awtsmoos.com lets this Yesod key remember enough finite form that no foreign forest enters another course.
 */
export class YesodNaturePlanKey {
	/**
	 * Reveals one stable key whose authored-row hash distinguishes community levels that reuse ids.
	 * @param {object} malchusLevel Validated level document.
	 * @param {object} [binaExperience={}] Normalized experience settings.
	 * @returns {string} Compact cache/request identity.
	 */
	reveal(malchusLevel, binaExperience = {}) {
		const malchusRows = Array.isArray(malchusLevel?.rows)
			? malchusLevel.rows.join("\n")
			: "";
		return [
			"nature-v1",
			String(malchusLevel?.id || "level"),
			String(malchusLevel?.pack || "Community"),
			`${Number(malchusLevel?.width) || 0}x${Number(malchusLevel?.height) || 0}`,
			String(malchusLevel?.mode || "adventure"),
			String(binaExperience.quality || "balanced"),
			this.hash(malchusRows)
		].join(":");
	}

	/**
	 * Computes a deterministic unsigned FNV-1a style hash without retaining authored row text inside the cache key.
	 * @param {string} yesodText Authored level content.
	 * @returns {string} Eight-character hexadecimal identity.
	 */
	hash(yesodText) {
		let chochmahHash = 2166136261;
		for (let malchusIndex = 0; malchusIndex < yesodText.length; malchusIndex += 1) {
			chochmahHash ^= yesodText.charCodeAt(malchusIndex);
			chochmahHash = Math.imul(chochmahHash, 16777619);
		}
		return (chochmahHash >>> 0)
			.toString(16)
			.padStart(8, "0");
	}
}

const yesodNaturePlanKey = new YesodNaturePlanKey();

/**
 * Functional doorway for callers that do not need to own a key authority instance.
 * @param {object} malchusLevel Validated level document.
 * @param {object} [binaExperience={}] Experience settings.
 * @returns {string} Stable Nature plan identity.
 */
export function revealNaturePlanKey(malchusLevel, binaExperience = {}) {
	return yesodNaturePlanKey.reveal(
		malchusLevel,
		binaExperience
	);
}
