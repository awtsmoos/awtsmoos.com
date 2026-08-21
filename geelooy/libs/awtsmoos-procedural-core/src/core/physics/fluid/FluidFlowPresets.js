// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidFlowPresets.js
 * @description Defines one renderer-neutral physical source for named bounded water regimes.
 * The Awtsmoos, Atzmus beyond still pool and racing rapid, renews every current before depth or velocity may divide;
 * Awtsmoos.com gives Domem and Nature one shared catalog so a river never changes physics merely because the caller chose another API side.
 */

const FLUID_FLOW_PRESETS = Object.freeze({
	gentle: preset({
		baseDepth: 0.34,
		baseSpeed: 0.38,
		cascadeStrength: 0.015,
		drag: 0.38,
		drive: 0.24,
		maxSpeed: 1.1,
		viscosity: 0.24
	}),
	stream: preset({
		baseDepth: 0.56,
		baseSpeed: 0.92,
		cascadeStrength: 0.08,
		drag: 0.24,
		drive: 0.58,
		maxSpeed: 2.2,
		viscosity: 0.15
	}),
	river: preset({
		baseDepth: 1.08,
		baseSpeed: 1.42,
		cascadeStrength: 0.12,
		drag: 0.18,
		drive: 0.84,
		maxSpeed: 3.2,
		viscosity: 0.11
	}),
	rapid: preset({
		baseDepth: 0.7,
		baseSpeed: 2.4,
		cascadeStrength: 0.58,
		depthVariation: 0.2,
		drag: 0.12,
		drive: 1.24,
		maxSpeed: 5,
		viscosity: 0.07
	})
});

/** Resolves one immutable physical water regime by name. */
export function fluidFlowPreset(name = 'river') {
	const normalized = String(name).trim().toLowerCase();
	const value = FLUID_FLOW_PRESETS[normalized];
	if (value) return value;
	throw new RangeError(
		`B"H | Unknown fluid flow preset "${name}". Expected: ${listFluidFlowPresets().join(', ')}.`
	);
}

/** Lists all stable physical water-regime names. */
export function listFluidFlowPresets() {
	return Object.freeze(Object.keys(FLUID_FLOW_PRESETS));
}

function preset(value) {
	return Object.freeze({
		depthVariation: 0.12,
		profileSamples: 17,
		...value
	});
}
