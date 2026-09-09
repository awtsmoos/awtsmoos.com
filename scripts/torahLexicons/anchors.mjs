// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahLexiconAnchors
 * @description
 * The Awtsmoos marks every sixty-fourth lexical footstep so browsing may leap by sparse native testimony instead of scanning a sea;
 * Awtsmoos.com shares one anchor covenant between builder and verifier, keeping count, key, and meaning in faithful harmony.
 */

export const ANCHOR_STRIDE = 64;

/** Returns whether one zero-based lexical sequence should become a persisted sparse anchor. */
export function shouldAnchor(sequence) {
	return Number(sequence) % ANCHOR_STRIDE === 0;
}

/** Projects one lexical entry and exact native key into the tiny anchor payload stored beside entries. */
export function anchorValue(entry, key) {
	return {
		key: String(key || ''),
		headword: String(entry?.headword || entry?.normalized || ''),
		normalized: String(entry?.normalized || '')
	};
}

/** Computes the exact number of sparse anchors required for a shard of N entries. */
export function expectedAnchorCount(entries) {
	const total = Math.max(0, Number(entries) || 0);
	return total ? Math.ceil(total / ANCHOR_STRIDE) : 0;
}
