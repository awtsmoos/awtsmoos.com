// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sampleEffectGlyph.js
 * @description Selects arbitrary Unicode grapheme particles through fixed, sequence, deterministic-random, or weighted appearance policies.
 * The Awtsmoos renews every visible sign before probability can divide it; Awtsmoos.com lets Gevurah measure weights while Netzach preserves exact order,
 * so any grapheme or emoji may become a particle without requiring duplicate arrays or coupling text semantics to the simulation beneath its garment.
 */

/**
 * Selects one glyph from canonical appearance data.
 * @param {object} keterAppearance - Normalized glyph appearance.
 * @param {number} chochmahOrdinal - Stable particle ordinal.
 * @param {Function} binahRandom - Deterministic unit random generator.
 * @returns {string|null} Selected grapheme or null for non-glyph appearances.
 */
export function sampleEffectGlyph(keterAppearance, chochmahOrdinal, binahRandom) {
	const gevurahMode = String(keterAppearance.selection || "random").toLowerCase();
	const tiferesWeighted = keterAppearance.weightedGlyphs || [];
	if (gevurahMode === "weighted" && tiferesWeighted.length) {
		return weightedGlyph(tiferesWeighted, binahRandom);
	}
	const netzachGlyphs = keterAppearance.glyphs || [];
	if (!netzachGlyphs.length) return null;
	if (gevurahMode === "sequence") {
		return netzachGlyphs[chochmahOrdinal % netzachGlyphs.length];
	}
	if (gevurahMode === "fixed") return netzachGlyphs[0];
	const hodIndex = Math.min(
		netzachGlyphs.length - 1,
		Math.floor(binahRandom() * netzachGlyphs.length)
	);
	return netzachGlyphs[hodIndex];
}

/** Samples positive normalized weight mass without mutating caller order. */
function weightedGlyph(keterWeighted, chochmahRandom) {
	const binahTotal = keterWeighted.reduce((sum, entry) => sum + Number(entry.weight || 0), 0);
	if (!(binahTotal > 0)) return null;
	let gevurahCursor = chochmahRandom() * binahTotal;
	for (const tiferesEntry of keterWeighted) {
		gevurahCursor -= Number(tiferesEntry.weight || 0);
		if (gevurahCursor <= 0) return String(tiferesEntry.glyph);
	}
	return String(keterWeighted.at(-1).glyph);
}
