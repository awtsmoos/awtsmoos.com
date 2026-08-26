// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterMaterialProfiles3d.js
 * @description Names renderer-neutral water families through optical intent and bounded dynamics multipliers, never shader ownership.
 * The Awtsmoos renews spring, ocean, river, pond, mud, glacier, and tropical light as one water essence;
 * Awtsmoos.com lets each finite material differ in absorption and motion without changing structural seed or primary mass.
 */

const MATERIALS = Object.freeze({
	fresh: material('fresh', [0.045, 0.018, 0.008], [0.008, 0.012, 0.018], 0.08, 0.035, {}),
	ocean: material('ocean', [0.08, 0.035, 0.014], [0.012, 0.02, 0.035], 0.12, 0.05, {
		foamThresholdScale: 0.86,
		spraySpeedScale: 0.9,
		vorticityScale: 1.15
	}),
	river: material('river', [0.07, 0.04, 0.02], [0.02, 0.026, 0.025], 0.18, 0.055, {
		foamThresholdScale: 0.95,
		vorticityScale: 1.1
	}),
	pond: material('pond', [0.12, 0.08, 0.045], [0.035, 0.045, 0.03], 0.32, 0.075, {
		spraySpeedScale: 1.2,
		viscosityScale: 1.08,
		vorticityScale: 0.8
	}),
	muddy: material('muddy', [0.24, 0.16, 0.09], [0.08, 0.07, 0.05], 0.65, 0.14, {
		cohesionScale: 1.08,
		foamThresholdScale: 1.15,
		viscosityScale: 1.25,
		vorticityScale: 0.65
	}),
	glacial: material('glacial', [0.025, 0.01, 0.005], [0.025, 0.035, 0.055], 0.035, 0.025, {
		viscosityScale: 1.05,
		vorticityScale: 0.95
	}),
	tropical: material('tropical', [0.035, 0.012, 0.006], [0.015, 0.028, 0.045], 0.07, 0.03, {
		viscosityScale: 0.9,
		vorticityScale: 1.05
	})
});

const ALIASES = Object.freeze({
	clear: 'fresh',
	lake: 'fresh',
	sea: 'ocean',
	stream: 'river'
});

/** Returns one immutable named material profile or throws for unknown intent. */
export function waterMaterialProfile3d(name = 'fresh') {
	const requested = String(name).trim().toLowerCase();
	const key = ALIASES[requested] ?? requested;
	const profile = MATERIALS[key];
	if (!profile) {
		throw new RangeError(`B"H | Unknown water material "${name}".`);
	}
	return profile;
}

/** Lists stable public water material names. */
export function listWaterMaterialProfiles3d() {
	return Object.freeze(Object.keys(MATERIALS));
}

function material(name, absorption, scattering, turbidity, roughness, dynamics) {
	return Object.freeze({
		name,
		dynamics: Object.freeze({
			cohesionScale: 1,
			foamThresholdScale: 1,
			spraySpeedScale: 1,
			viscosityScale: 1,
			vorticityScale: 1,
			...dynamics
		}),
		optics: Object.freeze({
			absorption: Object.freeze(absorption),
			ior: 1.333,
			roughness,
			scattering: Object.freeze(scattering),
			surfaceTension: 0.0728,
			turbidity
		})
	});
}
