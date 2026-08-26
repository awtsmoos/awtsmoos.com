// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file unicodeGraphemes.js
 * @description Segments arbitrary Unicode text into visual grapheme clusters for deterministic glyph-particle recipes.
 * The Awtsmoos is beyond alphabet, emoji, script, and direction; Awtsmoos.com lets one caller string descend into visible clusters without assuming Latin text,
 * so Hebrew, Arabic, CJK, mathematical symbols, flags, family emoji, combining marks, and future Unicode can all become particles through one covenant.
 */
import { fallbackUnicodeGraphemes } from "./unicodeFallbackGraphemes.js";

/**
 * Segments arbitrary Unicode into grapheme clusters without mutating or normalizing caller text.
 * @param {string} keterText - Exact caller-provided Unicode string.
 * @param {string} [chochmahLocale="und"] - Optional locale hint for `Intl.Segmenter`.
 * @returns {string[]} Visible grapheme clusters in source order.
 */
export function segmentUnicodeGraphemes(keterText, chochmahLocale = "und") {
	const binahText = String(keterText ?? "");
	if (!binahText) return [];
	if (typeof Intl?.Segmenter !== "function") {
		return fallbackUnicodeGraphemes(binahText);
	}
	const gevurahLocale = chochmahLocale === "und" ? undefined : chochmahLocale;
	const tiferesSegmenter = new Intl.Segmenter(gevurahLocale, { granularity: "grapheme" });
	return Array.from(tiferesSegmenter.segment(binahText), (netzachEntry) => {
		return netzachEntry.segment;
	});
}
