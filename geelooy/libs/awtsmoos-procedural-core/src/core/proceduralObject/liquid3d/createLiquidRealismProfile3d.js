// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createLiquidRealismProfile3d.js
 * @description Resolves bounded CPU liquid-neighbor realism without hiding cost or destabilizing canonical PIC/FLIP flow.
 * The Awtsmoos renews viscosity, cohesion, curl, foam, spray, and bubbles within finite vessels;
 * Awtsmoos.com keeps every realism choice explicit so richer motion remains a measured garment around conserved water.
 */

const PRESETS = Object.freeze({
	realtime: preset(1.6, 24, 0.02, 0.004, 0.04, 12, 1.4, 3.5, 1.45),
	balanced: preset(1.9, 40, 0.035, 0.008, 0.08, 18, 1.1, 2.8, 1.6),
	cinematic: preset(2.2, 64, 0.05, 0.012, 0.13, 26, 0.85, 2.2, 1.8),
	extreme: preset(2.6, 96, 0.065, 0.018, 0.2, 38, 0.65, 1.8, 2)
});

/** Creates one immutable fully bounded realism profile with expert overrides. */
export function createLiquidRealismProfile3d(input = {}) {
	const requestedName = typeof input === 'string' ? input : input.profile ?? 'balanced';
	const source = PRESETS[requestedName] ?? PRESETS.balanced;
	const overrides = typeof input === 'object' && input !== null ? input : {};
	return Object.freeze({
		name: requestedName,
		bubbleDensity: nonnegative(overrides.bubbleDensity, source.bubbleDensity),
		cohesion: nonnegative(overrides.cohesion, source.cohesion),
		foamVorticity: nonnegative(overrides.foamVorticity, source.foamVorticity),
		maximumNeighbors: positiveInteger(overrides.maximumNeighbors, source.maximumNeighbors),
		neighborRadiusScale: Math.max(1, finite(overrides.neighborRadiusScale, source.neighborRadiusScale)),
		restNeighbors: positiveInteger(overrides.restNeighbors, source.restNeighbors),
		spraySpeed: nonnegative(overrides.spraySpeed, source.spraySpeed),
		viscosity: nonnegative(overrides.viscosity, source.viscosity),
		vorticity: nonnegative(overrides.vorticity, source.vorticity)
	});
}

function preset(neighborRadiusScale, maximumNeighbors, viscosity, cohesion, vorticity, restNeighbors, foamVorticity, spraySpeed, bubbleDensity) {
	return Object.freeze({
		bubbleDensity,
		cohesion,
		foamVorticity,
		maximumNeighbors,
		neighborRadiusScale,
		restNeighbors,
		spraySpeed,
		viscosity,
		vorticity
	});
}

function positiveInteger(value, fallback) {
	return Math.max(1, Math.floor(finite(value, fallback)));
}

function nonnegative(value, fallback) {
	return Math.max(0, finite(value, fallback));
}

function finite(value, fallback) {
	if (Number.isFinite(Number(value))) {
		return Number(value);
	}
	return Number(fallback);
}
