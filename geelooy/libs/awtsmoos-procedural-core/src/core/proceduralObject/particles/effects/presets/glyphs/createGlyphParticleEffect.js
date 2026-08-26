// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createGlyphParticleEffect.js
 * @description Creates arbitrary grapheme-aware Unicode particle recipes from exact caller text, explicit glyph arrays, or weighted glyph declarations.
 * The Awtsmoos is beyond every alphabet, emoji, script, and visible sign; Awtsmoos.com lets Malchus carry exact caller-provided characters as particles,
 * while movement, collisions, trails, fire, orbit, and generated geometry remain universal vessels beneath whichever Unicode garment the caller chooses.
 */

/** Creates one friendly Unicode particle-effect recipe. */
export function createGlyphParticleEffect(keterOptions = {}) {
	validateGlyphSource(keterOptions);
	return {
		id: String(keterOptions.id || 'unicode-glyphs'),
		layers: [{
			appearance: {
				color: keterOptions.color || [1, 1, 1, 1],
				glyph: keterOptions.glyph,
				glyphs: keterOptions.glyphs,
				kind: 'glyph',
				locale: keterOptions.locale,
				orientation: keterOptions.orientation || 'camera',
				selection: keterOptions.selection,
				text: keterOptions.text,
				weightedGlyphs: keterOptions.weightedGlyphs
			},
			capacity: keterOptions.capacity ?? 384,
			direction: keterOptions.direction || [0, 1, 0],
			forces: keterOptions.forces || [],
			id: String(keterOptions.layerId || 'glyphs'),
			initialBurst: keterOptions.initialBurst ?? 0,
			lifecycle: keterOptions.lifecycle || {
				opacity: { from: 0, to: 1 },
				size: { from: 0.55, to: 1 }
			},
			lifetime: keterOptions.lifetime || [2, 4],
			rate: keterOptions.rate ?? 24,
			size: keterOptions.size || [0.2, 0.45],
			spawn: keterOptions.spawn || { kind: 'ring', radius: 1 },
			speed: keterOptions.speed || [0.2, 0.6],
			spread: keterOptions.spread ?? 0.18
		}],
		metadata: { exactCallerText: keterOptions.text ?? null, preset: 'glyphs' },
		quality: keterOptions.quality || 'high',
		seed: keterOptions.seed ?? keterOptions.id ?? 'unicode-glyphs'
	};
}

/** Requires at least one exact caller-owned glyph source. */
function validateGlyphSource(keterOptions) {
	const chochmahHasText = keterOptions.text != null && String(keterOptions.text).length > 0;
	const binahHasGlyphs = Array.isArray(keterOptions.glyphs) && keterOptions.glyphs.length > 0;
	const gevurahHasGlyph = keterOptions.glyph != null && String(keterOptions.glyph).length > 0;
	const tiferesHasWeights = Array.isArray(keterOptions.weightedGlyphs)
		&& keterOptions.weightedGlyphs.some((entry) => String(entry?.glyph ?? '').length > 0);
	if (!chochmahHasText && !binahHasGlyphs && !gevurahHasGlyph && !tiferesHasWeights) {
		throw new RangeError('B"H | Glyph effects require exact text, glyph, glyphs, or weightedGlyphs.');
	}
}
