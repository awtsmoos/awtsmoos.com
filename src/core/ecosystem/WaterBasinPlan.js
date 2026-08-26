// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterBasinPlan.js
 * @description Reveals deterministic pond, lake, and wetland shorelines as renderer-neutral spatial evidence.
 * The Awtsmoos renews every quiet shore from nothing while no polygon contains His essence; Awtsmoos.com lets one seeded
 * basin law expose water surface, depth intent, shore anchors, and ecological fringe without requiring a mesh or network garment.
 */

import { EcosystemRandom, ecosystemSeed } from './EcosystemRandom.js';
import { waterBasinPreset } from './WaterBasinPresets.js';

/** Creates one immutable deterministic water-basin plan. */
export function createWaterBasinPlan(kind = 'pond', options = {}) {
	const preset = waterBasinPreset(kind);
	const id = String(options.id || `${kind}-basin`);
	const center = normalizeCenter(options.center || options);
	const radiusX = positive(options.radiusX, preset.radiusX);
	const radiusZ = positive(options.radiusZ, preset.radiusZ);
	const irregularity = unit(options.irregularity ?? preset.irregularity);
	const seed = ecosystemSeed(options.seed ?? 613, options.randomNamespace || 'water-basin-shape');
	const shoreline = createShoreline(id, center, radiusX, radiusZ, irregularity, seed, options);
	const shoreBand = positive(options.shoreBand, preset.shoreBand);
	const wetlandFringe = Math.max(shoreBand, positive(options.wetlandFringe, preset.wetlandFringe));
	return Object.freeze({
		center,
		id,
		kind: String(kind),
		maxDepth: positive(options.maxDepth, preset.maxDepth),
		radiusX,
		radiusZ,
		seed,
		shoreBand,
		shoreline,
		summary: Object.freeze({
			approximateArea: Math.PI * radiusX * radiusZ,
			shoreSamples: shoreline.length,
			waterLevel: center.y
		}),
		wetlandFringe
	});
}

function createShoreline(id, center, radiusX, radiusZ, irregularity, seed, options) {
	const count = Math.max(8, Math.min(257, Math.round(finite(options.shoreSamples, 48))));
	const random = new EcosystemRandom(seed);
	const phaseA = random.range(-Math.PI, Math.PI);
	const phaseB = random.range(-Math.PI, Math.PI);
	return Object.freeze(Array.from({ length: count }, (_, index) => {
		const angle = index / count * Math.PI * 2;
		const harmonic = Math.sin(angle * 3 + phaseA) * 0.6 + Math.sin(angle * 5 + phaseB) * 0.4;
		const radialScale = Math.max(0.35, 1 + harmonic * irregularity);
		const cosine = Math.cos(angle);
		const sine = Math.sin(angle);
		return Object.freeze({
			angle,
			id: `${id}:shore:${index}`,
			index,
			normal: Object.freeze(normalize2(cosine / radiusX, sine / radiusZ)),
			x: center.x + cosine * radiusX * radialScale,
			y: center.y,
			z: center.z + sine * radiusZ * radialScale
		});
	}));
}

function normalizeCenter(value) {
	return Object.freeze({
		x: finite(value.x, 0),
		y: finite(value.y, 0),
		z: finite(value.z, 0)
	});
}

function normalize2(x, z) {
	const length = Math.max(1e-8, Math.hypot(x, z));
	return { x: x / length, y: 0, z: z / length };
}

function positive(value, fallback) {
	return Math.max(0.001, finite(value, fallback));
}

function unit(value) {
	return Math.max(0, Math.min(1, finite(value, 0)));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
