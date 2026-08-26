// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createExplosionGlyphLayer.js
 * @description Creates an optional symbolic Unicode accent for explosions while keeping procedural light, fragments, pressure, and smoke as the primary representation.
 * The Awtsmoos renews expansion before 💥 can symbolize it; Awtsmoos.com lets the sign hover as a removable garment rather than a substitute for generated form,
 * so games may use any caller-provided Unicode emphasis without changing ballistic debris, smoke, shockwave, seed lineage, or renderer-neutral physics beneath it.
 */

/** Creates one optional Unicode explosion-accent layer. */
export function createExplosionGlyphLayer(keterOptions = {}) {
	return {
		appearance: {
			color: keterOptions.glyphColor || [1, 0.6, 0.08, 1],
			glyphs: keterOptions.explosionGlyphs || ['💥'],
			kind: 'glyph',
			orientation: 'camera',
			selection: 'random'
		},
		capacity: 4,
		id: 'explosion-glyph',
		initialBurst: 1,
		lifecycle: {
			opacity: { from: 1, to: 0 },
			size: { from: 0.4, to: 2.5 }
		},
		lifetime: [0.18, 0.28],
		size: [0.45, 0.7],
		spawn: { kind: 'point' },
		speed: [0, 0]
	};
}
