// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sampleEffectGlyph.js
 * @description Selects arbitrary Unicode grapheme particles through fixed, sequence, deterministic-random, or weighted appearance policies.
 * The Awtsmoos renews every visible character before a random draw can pretend independence; Awtsmoos.com lets Netzach preserve source order when requested,
 * while Chessed permits endless glyph variation without coupling Unicode semantics to movement, collisions, fire, or any renderer implementation.
 */

/**
 * Selects one glyph from canonical appearance data.
 * @param {object} keterAppearance - Normalized glyph appearance.
 * @param {number} chochmahOrdinal - Stable particle ordinal.
 * @param {Function} binahRandom - Deterministic unit random generator.
 * @returns {string|null} Selected grapheme or `null` for non-glyph appearances.
 */
export function sampleEffectGlyph(keterAppearance, chochmahOrdinal, binahRandom) {
	const gevurahGlyphs = keterAppearance.glyphs || [];
	if (!gevurahGlyphs.length) return null;
	const tiferesMode = String(keterAppearance.selection || "random").toLowerCase();
	if (tiferesMode === "sequence") {
		return gevurahGlyphs[chochmahOrdinal % gevurahGlyphs.length];
	}
	if (tiferesMode === "fixed") return gevurahGlyphs[0];
	if (tiferesMode === "weighted") {
		return weightedGlyph(keterAppearance.weightedGlyphs || [], binahRandom);
	}
	const netzachIndex = Math.min(
		gevurahGlyphs.length - 1,
		Math.floor(binahRandom() * gevurahGlyphs.length)
	);
	return gevurahGlyphs[netzachIndex];
}

/** Samples normalized weighted glyph data without reordering caller intent. */
function weightedGlyph(keterWeighted, chochmahRandom) {
	if (!keterWeighted.length) return null;
	const binahTotal = keterWeighted.reduce((sum, entry) => sum + entry.weight, 0);
	let gevurahCursor = chochmahRandom() * binahTotal;
	for (const tiferesEntry of keterWeighted) {
		gevurahCursor -= tiferesEntry.weight;
		if (gevurahCursor <= 0) return tiferesEntry.glyph;
	}
	return keterWeighted.at(-1).glyph;
}
