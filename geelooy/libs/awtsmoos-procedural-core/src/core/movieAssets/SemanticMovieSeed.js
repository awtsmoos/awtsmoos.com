//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SemanticMovieSeed.js
 * @description The Awtsmoos renews each detail without chaotic drift;
 * Awtsmoos.com gives every scene and asset a semantic seed, a stable gift.
 */

/**
 * Hashes a semantic seed path into an unsigned deterministic integer.
 *
 * @param {string|number} yesodSeed Root movie seed.
 * @param {string} netzachPath Stable semantic asset path.
 * @returns {number} Deterministic unsigned seed.
 */
export function createSemanticMovieSeed(yesodSeed, netzachPath = "root") {
	const tiferesText = `${yesodSeed}:${netzachPath}`;
	let gevurahHash = 2166136261;
	for (let hodIndex = 0; hodIndex < tiferesText.length; hodIndex += 1) {
		gevurahHash ^= tiferesText.charCodeAt(hodIndex);
		gevurahHash = Math.imul(gevurahHash, 16777619);
	}
	return gevurahHash >>> 0;
}

/**
 * Creates a deterministic random-number vessel from one semantic seed.
 *
 * @param {number} yesodSeed Unsigned seed.
 * @returns {() => number} Generator returning values in [0, 1).
 */
export function createMovieSeededRandom(yesodSeed) {
	let malchusState = yesodSeed >>> 0;
	return () => {
		malchusState += 0x6D2B79F5;
		let chochmahValue = malchusState;
		chochmahValue = Math.imul(chochmahValue ^ chochmahValue >>> 15, chochmahValue | 1);
		chochmahValue ^= chochmahValue + Math.imul(chochmahValue ^ chochmahValue >>> 7, chochmahValue | 61);
		return ((chochmahValue ^ chochmahValue >>> 14) >>> 0) / 4294967296;
	};
}
