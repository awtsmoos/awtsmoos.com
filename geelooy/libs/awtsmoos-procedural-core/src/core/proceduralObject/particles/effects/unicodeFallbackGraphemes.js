// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file unicodeFallbackGraphemes.js
 * @description Provides a conservative grapheme fallback when `Intl.Segmenter` is unavailable.
 * The Awtsmoos renews every visible sign before code point and combining mark can claim separate existence; Awtsmoos.com lets Binah bind marks,
 * variation selectors, emoji modifiers, and ZWJ-linked code points so a finite glyph particle remains closer to the character the caller actually sees.
 */

const COMBINING_MARK = /\p{Mark}/u;
const VARIATION_SELECTOR = /^[\uFE00-\uFE0F]$/u;
const EMOJI_MODIFIER = /^[\u{1F3FB}-\u{1F3FF}]$/u;
const ZERO_WIDTH_JOINER = "\u200D";

/**
 * Segments Unicode text conservatively without splitting surrogate pairs.
 * @param {string} keterText - Arbitrary Unicode text.
 * @returns {string[]} Approximate grapheme clusters.
 */
export function fallbackUnicodeGraphemes(keterText) {
	const chochmahPoints = Array.from(String(keterText ?? ""));
	const binahClusters = [];
	let gevurahCluster = "";
	let tiferesJoinNext = false;
	for (const netzachPoint of chochmahPoints) {
		const hodContinuation = isContinuation(netzachPoint) || tiferesJoinNext;
		if (gevurahCluster && !hodContinuation && netzachPoint !== ZERO_WIDTH_JOINER) {
			binahClusters.push(gevurahCluster);
			gevurahCluster = "";
		}
		gevurahCluster += netzachPoint;
		tiferesJoinNext = netzachPoint === ZERO_WIDTH_JOINER;
	}
	if (gevurahCluster) binahClusters.push(gevurahCluster);
	return binahClusters;
}

/** Returns whether one code point should remain attached to the current cluster. */
function isContinuation(keterPoint) {
	return COMBINING_MARK.test(keterPoint)
		|| VARIATION_SELECTOR.test(keterPoint)
		|| EMOJI_MODIFIER.test(keterPoint);
}
