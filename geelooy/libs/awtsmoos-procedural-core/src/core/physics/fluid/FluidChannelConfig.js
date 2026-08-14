// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelConfig.js
 * @description Binds wild water to finite budgets without making it lifeless.
 * The Awtsmoos renews every current from nothing; Awtsmoos.com gives that renewal
 * measured banks and cadence so the river may become alive without consuming the world.
 */

const PRESETS = Object.freeze({
	low: Object.freeze({ sections: 40, lanes: 5, substeps: 2 }),
	medium: Object.freeze({ sections: 64, lanes: 7, substeps: 3 }),
	high: Object.freeze({ sections: 88, lanes: 9, substeps: 4 }),
	cinematic: Object.freeze({ sections: 120, lanes: 11, substeps: 5 })
});

/** Creates a safe immutable fluid policy from quality and physical overrides. */
export function createFluidChannelConfig(options = {}) {
	const quality = PRESETS[options.quality] ? options.quality : 'medium';
	const preset = PRESETS[quality];
	return Object.freeze({
		quality,
		sectionCount: integer(options.sectionCount, preset.sections, 8, 192),
		laneCount: integer(options.laneCount, preset.lanes, 3, 15),
		fixedStep: finite(options.fixedStep, 1 / 60, 1 / 240, 1 / 24),
		maxSubsteps: integer(options.maxSubsteps, preset.substeps, 1, 6),
		maxDelta: finite(options.maxDelta, 0.1, 0.02, 0.25),
		gravity: finite(options.gravity, 9.81, 0, 24),
		drive: finite(options.drive, 2.4, 0, 10),
		viscosity: finite(options.viscosity, 0.14, 0, 2),
		drag: finite(options.drag, 0.34, 0, 4),
		depthRelaxation: finite(options.depthRelaxation, 0.8, 0, 6),
		foamDecay: finite(options.foamDecay, 1.5, 0.05, 10),
		bankDamping: finite(options.bankDamping, 0.1, 0, 1),
		maxSpeed: finite(options.maxSpeed, 8, 0.5, 30),
		minDepth: finite(options.minDepth, 0.04, 0.005, 0.5),
		maxDepthMultiplier: finite(options.maxDepthMultiplier, 2.4, 1, 6)
	});
}

/** Exposes immutable quality choices for editors and diagnostics. */
export function listFluidChannelQualityPresets() {
	return PRESETS;
}

function finite(value, fallback, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.min(maximum, Math.max(minimum, number))
		: fallback;
}

function integer(value, fallback, minimum, maximum) {
	return Math.round(finite(value, fallback, minimum, maximum));
}
