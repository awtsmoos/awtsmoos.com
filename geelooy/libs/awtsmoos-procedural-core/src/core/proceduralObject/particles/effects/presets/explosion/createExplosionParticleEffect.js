// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createExplosionParticleEffect.js
 * @description Composes a staged deterministic explosion from flash, sparks, 3D debris, hot smoke, pressure shell, and optional Unicode accent.
 * The Awtsmoos renews all apparent stages in one present while finite perception receives them across different timescales; Awtsmoos.com lets Tiferes compose them,
 * so each stage remains independently realistic, budgetable, inspectable, replaceable, and serializable instead of collapsing into one giant preset implementation.
 */
import { createExplosionDebrisLayer } from './createExplosionDebrisLayer.js';
import { createExplosionFlashLayer } from './createExplosionFlashLayer.js';
import { createExplosionGlyphLayer } from './createExplosionGlyphLayer.js';
import { createExplosionShockwaveLayer } from './createExplosionShockwaveLayer.js';
import { createExplosionSmokeLayer } from './createExplosionSmokeLayer.js';
import { createExplosionSparkLayer } from './createExplosionSparkLayer.js';

/** Creates one staged explosion recipe for the high-level effect normalizer. */
export function createExplosionParticleEffect(keterOptions = {}) {
	const chochmahLayers = [
		createExplosionFlashLayer(keterOptions),
		createExplosionShockwaveLayer(keterOptions),
		createExplosionSparkLayer(keterOptions),
		createExplosionDebrisLayer(keterOptions),
		createExplosionSmokeLayer(keterOptions)
	];
	if (keterOptions.glyphs !== false) {
		chochmahLayers.push(createExplosionGlyphLayer(keterOptions));
	}
	return {
		id: String(keterOptions.id || 'explosion'),
		layers: chochmahLayers,
		metadata: {
			model: 'staged-realtime-explosion-particles',
			preset: 'explosion',
			realism: 'flash-pressure-sparks-debris-smoke'
		},
		quality: keterOptions.quality || 'high',
		seed: keterOptions.seed ?? keterOptions.id ?? 'explosion'
	};
}
