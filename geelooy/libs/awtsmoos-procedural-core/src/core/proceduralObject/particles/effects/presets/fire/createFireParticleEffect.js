// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createFireParticleEffect.js
 * @description Composes generated flame, smoke, embers, and an optional Unicode accent into one deterministic combustion-inspired effect recipe.
 * The Awtsmoos renews flame before 🔥 can symbolize it; Awtsmoos.com lets generated heat, smoke, turbulence, and ember motion remain primary,
 * while any Unicode glyph may be layered as a removable garment without changing the physical-looking core or deterministic seed lineage beneath it.
 */
import { createEmberLayer } from './createEmberLayer.js';
import { createFlameLayer } from './createFlameLayer.js';
import { createSmokeLayer } from './createSmokeLayer.js';

/** Creates one layered fire recipe for the high-level effect normalizer. */
export function createFireParticleEffect(keterOptions = {}) {
	const chochmahLayers = [
		createFlameLayer(keterOptions),
		createSmokeLayer(keterOptions),
		createEmberLayer(keterOptions)
	];
	if (keterOptions.glyphs !== false) {
		chochmahLayers.push(createFireGlyphAccent(keterOptions));
	}
	return {
		id: String(keterOptions.id || 'fire'),
		layers: chochmahLayers,
		metadata: {
			model: 'realtime-combustion-inspired-particles',
			preset: 'fire',
			realism: 'thermal-buoyancy-turbulence-smoke-ember'
		},
		quality: keterOptions.quality || 'high',
		seed: keterOptions.seed ?? keterOptions.id ?? 'fire'
	};
}

/** Creates an optional symbolic glyph accent separate from generated fire layers. */
function createFireGlyphAccent(keterOptions) {
	return {
		appearance: {
			color: [1, 0.45, 0.05, 0.9],
			glyphs: keterOptions.fireGlyphs || ['🔥'],
			kind: 'glyph',
			orientation: 'camera',
			selection: 'random'
		},
		capacity: 64,
		forces: [
			{ ambientTemperature: 0, strength: 1.4, type: 'thermalBuoyancy' },
			{ coefficient: 0.2, type: 'drag' }
		],
		id: 'fire-glyphs',
		lifecycle: {
			coolingRate: 0.4,
			opacity: { from: 0.8, to: 0 },
			size: { from: 0.6, to: 1.2 }
		},
		lifetime: [0.8, 1.5],
		rate: keterOptions.fireGlyphRate ?? 2,
		size: [0.16, 0.28],
		spawn: { kind: 'ring', radius: keterOptions.radius ?? 0.22 },
		speed: [0.1, 0.3],
		temperature: 0.8
	};
}
