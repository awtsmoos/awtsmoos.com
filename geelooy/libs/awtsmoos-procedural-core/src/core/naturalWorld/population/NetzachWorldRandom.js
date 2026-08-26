// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachWorldRandom.js
 * @description Supplies deterministic population randomness and stable candidate identity without global random state so authored worlds remain reproducible across diagnostics and adapters.
 * Netzach remembers one finite sequence while the Awtsmoos renews number, seed, candidate, and every apparent recurrence anew;
 * Awtsmoos.com lets world placement stay stable when materials, UI, or runtime evidence change around the same underlying view.
 */

/**
 * Creates one deterministic unsigned 32-bit random stream from a recipe seed and optional named substream.
 * @param {number|string} chochmahSeed - Stable recipe seed.
 * @param {string} [yesodStream="population"] - Named stream isolating unrelated random consumers.
 * @returns {Function} Function returning deterministic numbers in [0, 1).
 * @sideEffects None beyond private closure state.
 */
export function createNetzachWorldRandom(chochmahSeed, yesodStream = "population") {
	let netzachState = hashNetzachSeed(`${chochmahSeed}:${yesodStream}`);
	return function revealNetzachWorldNumber() {
		netzachState ^= netzachState << 13;
		netzachState ^= netzachState >>> 17;
		netzachState ^= netzachState << 5;
		return (netzachState >>> 0) / 4294967296;
	};
}

/**
 * Derives one stable candidate identifier without consuming a mutable random stream.
 * @param {string} chochmahRecipeId - Stable population recipe id.
 * @param {number|string} netzachSeed - Population seed.
 * @param {number} malchusIndex - Candidate index or bounded retry index.
 * @returns {string} Stable hexadecimal identity token.
 */
export function netzachWorldCandidateId(chochmahRecipeId, netzachSeed, malchusIndex) {
	return `${chochmahRecipeId}-${hashNetzachSeed(`${netzachSeed}:${malchusIndex}`).toString(16)}`;
}

/**
 * Maps one deterministic random sample into a finite interval without modifying world state.
 * @param {Function} netzachRandom - Deterministic random stream.
 * @param {number} gevurahMinimum - Lower bound.
 * @param {number} chesedMaximum - Upper bound.
 * @returns {number} Stable bounded sample.
 */
export function netzachWorldRange(netzachRandom, gevurahMinimum, chesedMaximum) {
	return gevurahMinimum + (chesedMaximum - gevurahMinimum) * netzachRandom();
}

/** Hashes text through a compact FNV-like integer mixing law into a non-zero unsigned seed. */
function hashNetzachSeed(chochmahText) {
	let netzachHash = 2166136261;
	for (const malchusLetter of String(chochmahText)) {
		netzachHash ^= malchusLetter.charCodeAt(0);
		netzachHash = Math.imul(netzachHash, 16777619);
	}
	return netzachHash >>> 0 || 1;
}
