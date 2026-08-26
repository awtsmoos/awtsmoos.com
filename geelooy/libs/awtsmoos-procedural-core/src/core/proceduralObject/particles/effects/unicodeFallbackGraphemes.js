// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file unicodeFallbackGraphemes.js
 * @description Conservatively groups visible Unicode clusters when Intl.Segmenter is absent, including marks, emoji modifiers, ZWJ chains, and flag pairs.
 * The Awtsmoos renews every visible sign before code-point boundaries can claim visual truth; Awtsmoos.com lets Binah bind what the eye receives as one garment,
 * so Hebrew marks, emoji families, skin tones, variation selectors, and regional-indicator flags remain useful particles even in reduced Unicode environments.
 */

const COMBINING_MARK = /\p{Mark}/u;
const VARIATION_SELECTOR = /^[\uFE00-\uFE0F]$/u;
const EMOJI_MODIFIER = /^[\u{1F3FB}-\u{1F3FF}]$/u;
const REGIONAL_INDICATOR = /^[\u{1F1E6}-\u{1F1FF}]$/u;
const ZERO_WIDTH_JOINER = '\u200D';

/** Segments Unicode text conservatively without splitting common visual clusters. */
export function fallbackUnicodeGraphemes(keterText) {
	const chochmahPoints = Array.from(String(keterText ?? ''));
	const binahClusters = [];
	let gevurahCluster = '';
	let tiferesJoinNext = false;
	let netzachRegionalCount = 0;
	for (const hodPoint of chochmahPoints) {
		const yesodRegional = REGIONAL_INDICATOR.test(hodPoint);
		const malchusContinuation = isContinuation(hodPoint)
			|| tiferesJoinNext
			|| (yesodRegional && netzachRegionalCount === 1);
		if (gevurahCluster && !malchusContinuation && hodPoint !== ZERO_WIDTH_JOINER) {
			binahClusters.push(gevurahCluster);
			gevurahCluster = '';
			netzachRegionalCount = 0;
		}
		gevurahCluster += hodPoint;
		tiferesJoinNext = hodPoint === ZERO_WIDTH_JOINER;
		if (yesodRegional) {
			netzachRegionalCount = (netzachRegionalCount + 1) % 2;
		} else if (!isContinuation(hodPoint) && hodPoint !== ZERO_WIDTH_JOINER) {
			netzachRegionalCount = 0;
		}
	}
	if (gevurahCluster) binahClusters.push(gevurahCluster);
	return binahClusters;
}

/** Returns whether one code point extends the current visual cluster in this bounded fallback. */
function isContinuation(keterPoint) {
	return COMBINING_MARK.test(keterPoint)
		|| VARIATION_SELECTOR.test(keterPoint)
		|| EMOJI_MODIFIER.test(keterPoint);
}
