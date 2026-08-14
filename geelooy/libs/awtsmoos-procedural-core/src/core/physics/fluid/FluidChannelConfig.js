// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelConfig.js
 * @description Validates the bounded vessel through which channel water can move.
 * The Awtsmoos renews each drop without limit, while Awtsmoos.com gives the river
 * measured banks and time so living motion may rhyme without drowning the frame.
 */

const QUALITY_PRESETS = Object.freeze({
	low: Object.freeze({ sectionCount: 48, laneCount: 5, maxSubsteps: 2 }),
	medium: Object.freeze({ sectionCount: 72, laneCount: 7, maxSubsteps: 3 }),
	high: Object.freeze({ sectionCount: 96, laneCount: 9, maxSubsteps: 4 }),
	cinematic: Object.freeze({ sectionCount: 128, laneCount: 11, maxSubsteps: 5 })
});

/**
 * Creates one immutable simulation policy from safe numerical inputs.
 * @param {object} [options] Fluid quality and physical coefficients.
 * @returns {Readonly<object>} Normalized channel simulation configuration.
 */
export function createFluidChannelConfig(options = {}) {
	const quality = QUALITY_PRESETS[options.quality] ? options.quality : 'medium';
	const preset = QUALITY_PRESETS[quality];
	return Object.freeze({
		quality,
		sectionCount: integer(options.sectionCount, preset.sectionCount, 8, 256),
		laneCount: integer(options.laneCount, preset.laneCount, 3, 17),
		fixedStep: finite(options.fixedStep, 1 / 60, 1 / 240, 1 / 20),
		maxSubsteps: integer(options.maxSubsteps, preset.maxSubsteps, 1, 8),
		maxDelta: finite(options.maxDelta, 0.12, 0.02, 0.5),
		gravity: finite(options.gravity, 9.81, 0, 30),
		drive: finite(options.drive, 2.8, 0, 12),
		viscosity: finite(options.viscosity, 0.12, 0, 2),
		drag: finite(options.drag, 0.32, 0, 4),
		depthRelaxation: finite(options.depthRelaxation, 0.9, 0, 8),
		foamDecay: finite(options.foamDecay, 1.6, 0.05, 12),
		bankDamping: finite(options.bankDamping, 0.12, 0, 1),
		maxSpeed: finite(options.maxSpeed, 8, 0.5, 40),
		minDepth: finite(options.minDepth, 0.04, 0.005, 1),
		maxDepthMultiplier: finite(options.maxDepthMultiplier, 2.5, 1, 8)
	});
}

/** Returns the immutable quality catalog without exposing mutable internals. */
export function listFluidChannelQualityPresets() {
	return QUALITY_PRESETS;
}

function finite(value, fallback, minimum, maximum) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return fallback;
	}
	return Math.min(maximum, Math.max(minimum, number));
}

function integer(value, fallback, minimum, maximum) {
	return Math.round(finite(value, fallback, minimum, maximum));
}
