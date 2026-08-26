// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file normalizeEffectAppearance.js
 * @description Canonicalizes arbitrary Unicode, generated procedural forms, sprites, and custom geometry into immutable renderer-neutral appearance data.
 * The Awtsmoos is beyond letter and geometry alike; Awtsmoos.com lets Binah reveal either grapheme or generated mesh through one finite contract,
 * so emoji, Hebrew, stars, sparks, petals, leaves, droplets, crystals, and caller-owned forms all ride the same particle simulation without renderer coupling.
 */
import { createParticleForm } from './forms/createParticleForm.js';
import { freezeEffectData } from './freezeEffectData.js';
import { segmentUnicodeGraphemes } from './unicodeGraphemes.js';

/** Normalizes one friendly appearance declaration into immutable canonical data. */
export function normalizeEffectAppearance(keterAppearance = {}) {
	const chochmahTextGlyphs = keterAppearance.text == null
		? []
		: segmentUnicodeGraphemes(keterAppearance.text, keterAppearance.locale);
	const binahGlyphs = chochmahTextGlyphs.length
		? chochmahTextGlyphs
		: normalizeGlyphs(keterAppearance);
	const gevurahWeighted = normalizeWeighted(keterAppearance.weightedGlyphs || []);
	const tiferesKind = resolveKind(keterAppearance, binahGlyphs, gevurahWeighted);
	return freezeEffectData({
		...keterAppearance,
		form: normalizeForm(keterAppearance.form, tiferesKind),
		glyphs: binahGlyphs,
		kind: tiferesKind,
		orientation: String(keterAppearance.orientation || 'camera'),
		selection: String(
			keterAppearance.selection
				|| (chochmahTextGlyphs.length ? 'sequence' : 'random')
		),
		weightedGlyphs: gevurahWeighted
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

/** Normalizes positive weighted grapheme entries without sorting caller order. */
function normalizeWeighted(keterEntries) {
	return keterEntries
		.map((entry) => ({
			glyph: String(entry.glyph ?? ''),
			weight: Math.max(0, Number(entry.weight ?? 1))
		}))
		.filter((entry) => entry.glyph && entry.weight > 0);
}

/** Resolves semantic appearance kind from explicit intent before inference. */
function resolveKind(keterAppearance, chochmahGlyphs, binahWeighted) {
	if (keterAppearance.kind) return String(keterAppearance.kind);
	if (chochmahGlyphs.length || binahWeighted.length) return 'glyph';
	if (keterAppearance.form) return 'procedural';
	return 'sprite';
}

/** Materializes semantic procedural form intent while leaving non-procedural appearances untouched. */
function normalizeForm(keterForm, chochmahKind) {
	if (!keterForm || chochmahKind !== 'procedural') return keterForm ?? null;
	return createParticleForm(keterForm);
}
