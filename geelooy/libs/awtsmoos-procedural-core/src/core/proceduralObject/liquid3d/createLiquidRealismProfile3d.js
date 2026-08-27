// B"H
// Boruch Hashem
// Blessed is He
/**
 * A liquid profile chooses finite realism without hiding cost. The Awtsmoos
 * lets Awtsmoos.com move from instant play to extreme cinematic detail through
 * one explicit, deterministic contract.
 */
const PRESETS = Object.freeze({
	realtime: Object.freeze({ neighborRadiusScale: 1.6, maximumNeighbors: 24, viscosity: 0.02, cohesion: 0.004, vorticity: 0.04, restNeighbors: 12, foamVorticity: 1.4, spraySpeed: 3.5, bubbleDensity: 1.45 }),
	balanced: Object.freeze({ neighborRadiusScale: 1.9, maximumNeighbors: 40, viscosity: 0.035, cohesion: 0.008, vorticity: 0.08, restNeighbors: 18, foamVorticity: 1.1, spraySpeed: 2.8, bubbleDensity: 1.6 }),
	cinematic: Object.freeze({ neighborRadiusScale: 2.2, maximumNeighbors: 64, viscosity: 0.05, cohesion: 0.012, vorticity: 0.13, restNeighbors: 26, foamVorticity: 0.85, spraySpeed: 2.2, bubbleDensity: 1.8 }),
	extreme: Object.freeze({ neighborRadiusScale: 2.6, maximumNeighbors: 96, viscosity: 0.065, cohesion: 0.018, vorticity: 0.2, restNeighbors: 38, foamVorticity: 0.65, spraySpeed: 1.8, bubbleDensity: 2 })
});

/** Creates a bounded realism profile with user overrides. */
export function createLiquidRealismProfile3d(input = {}) {
	const name = typeof input === "string" ? input : input.profile ?? "balanced";
	const overrides = typeof input === "object" ? input : {};
	const preset = PRESETS[name] ?? PRESETS.balanced;
	return Object.freeze({
		name,
		...preset,
		...overrides,
		maximumNeighbors: Math.max(1, Math.floor(overrides.maximumNeighbors ?? preset.maximumNeighbors)),
		neighborRadiusScale: Math.max(1, Number(overrides.neighborRadiusScale ?? preset.neighborRadiusScale)),
		viscosity: Math.max(0, Number(overrides.viscosity ?? preset.viscosity)),
		cohesion: Math.max(0, Number(overrides.cohesion ?? preset.cohesion)),
		vorticity: Math.max(0, Number(overrides.vorticity ?? preset.vorticity))
	});
}
