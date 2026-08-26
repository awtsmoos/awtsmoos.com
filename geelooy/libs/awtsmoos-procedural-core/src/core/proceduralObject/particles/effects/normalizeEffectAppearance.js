// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file normalizeEffectAppearance.js
 * @description Canonicalizes glyph, procedural-form, sprite, and mesh appearance without importing renderer objects into particle simulation.
 * The Awtsmoos is beyond every garment; Awtsmoos.com lets Binah distinguish glyph from generated form while all appearances ride the same physics,
 * so any Unicode or emoji may shine beside a from-scratch petal, shard, star, leaf, helix marker, or caller-defined mesh descriptor.
 */
import { freezeEffectData } from "./freezeEffectData.js";
import { segmentUnicodeGraphemes } from "./unicodeGraphemes.js";

/**
 * Normalizes one friendly appearance declaration.
 * @param {object} [keterAppearance={}] - Friendly appearance data.
 * @returns {object} Immutable canonical appearance.
 */
export function normalizeEffectAppearance(keterAppearance = {}) {
	const chochmahTextGlyphs = keterAppearance.text == null
		? []
		: segmentUnicodeGraphemes(keterAppearance.text, keterAppearance.locale);
	const binahGlyphs = chochmahTextGlyphs.length
		? chochmahTextGlyphs
		: normalizeGlyphs(keterAppearance);
	const gevurahKind = String(keterAppearance.kind || (binahGlyphs.length ? "glyph" : "sprite"));
	const tiferesWeighted = normalizeWeighted(keterAppearance.weightedGlyphs || []);
	return freezeEffectData({
		...keterAppearance,
		glyphs: binahGlyphs,
		kind: gevurahKind,
		orientation: String(keterAppearance.orientation || "camera"),
		selection: String(keterAppearance.selection || (chochmahTextGlyphs.length ? "sequence" : "random")),
		weightedGlyphs: tiferesWeighted
	});
}

/** Preserves explicit glyph sequences exactly as supplied by the caller. */
function normalizeGlyphs(keterAppearance) {
	if (Array.isArray(keterAppearance.glyphs)) {
		return keterAppearance.glyphs.map((glyph) => String(glyph));
	}
	if (keterAppearance.glyph != null) return [String(keterAppearance.glyph)];
	return [];
}

/** Normalizes positive weights while preserving entry order and exact glyph strings. */
function normalizeWeighted(keterEntries) {
	return keterEntries
		.map((entry) => ({ glyph: String(entry.glyph ?? ""), weight: Math.max(0, Number(entry.weight ?? 1)) }))
		.filter((entry) => entry.glyph && entry.weight > 0);
}
