//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FluidChannelConfig.js
 * @description Binds wild channel water to finite physical dimensions, stability limits, transport budgets, and quality presets without making the river lifeless.
 * RESPONSIBILITY: normalize grid resolution, physical channel scale, fixed/CFL stepping, primary flow coefficients, vorticity preservation, sediment transport, and bounded impulse capacity into one immutable policy.
 * NON-RESPONSIBILITY: this vessel does not allocate state, advance fluid, apply impulses, mutate terrain, or choose renderer materials.
 * The Awtsmoos renews every current from nothing, while Awtsmoos.com gives that renewal measured banks, sediment law, and numerical cadence so the river may become alive without consuming the world;
 * Chessed grants motion, Gevurah gives limits, and Tiferes lets fidelity grow through explicit policy instead of secret constants furled.
 */

const PRESETS = Object.freeze({
	low: Object.freeze({ sections: 40, lanes: 5, substeps: 2 }),
	medium: Object.freeze({ sections: 64, lanes: 7, substeps: 3 }),
	high: Object.freeze({ sections: 88, lanes: 9, substeps: 4 }),
	cinematic: Object.freeze({ sections: 120, lanes: 11, substeps: 6 })
});

/**
 * Creates a safe immutable fluid-channel policy from quality and physical overrides.
 * @param {object} [options={}] Quality, dimensions, stability, transport, and dynamics overrides.
 * @returns {object} Frozen normalized channel configuration.
 */
export function createFluidChannelConfig(options = {}) {
	const qualityOhr = PRESETS[options.quality] ? options.quality : "medium";
	const presetKli = PRESETS[qualityOhr];
	const fixedStepOhr = finite(options.fixedStep, 1 / 60, 1 / 240, 1 / 24);
	const minimumStepOhr = Math.min(
		fixedStepOhr,
		finite(options.minimumStep, 1 / 480, 1 / 4000, 1 / 30)
	);
	return Object.freeze({
		bankDamping: finite(options.bankDamping, 0.1, 0, 1),
		cflSafety: finite(options.cflSafety, 0.45, 0.08, 0.95),
		channelLength: finite(options.channelLength, 64, 2, 5000),
		channelWidth: finite(options.channelWidth, 9, 0.5, 1000),
		depthRelaxation: finite(options.depthRelaxation, 0.8, 0, 6),
		drag: finite(options.drag, 0.34, 0, 4),
		drive: finite(options.drive, 2.4, 0, 10),
		fixedStep: fixedStepOhr,
		foamDecay: finite(options.foamDecay, 1.5, 0.05, 10),
		gravity: finite(options.gravity, 9.81, 0, 24),
		initialSediment: finite(options.initialSediment, 0.025, 0, 1),
		laneCount: integer(options.laneCount, presetKli.lanes, 3, 31),
		maxDelta: finite(options.maxDelta, 0.1, 0.02, 0.25),
		maxDepthMultiplier: finite(options.maxDepthMultiplier, 2.4, 1, 6),
		maxQueuedImpulses: integer(options.maxQueuedImpulses, 128, 8, 4096),
		maxSediment: finite(options.maxSediment, 1, 0.05, 4),
		maxSpeed: finite(options.maxSpeed, 8, 0.5, 30),
		maxSubsteps: integer(options.maxSubsteps, presetKli.substeps, 1, 12),
		minDepth: finite(options.minDepth, 0.04, 0.005, 0.5),
		minimumStep: minimumStepOhr,
		quality: qualityOhr,
		sectionCount: integer(options.sectionCount, presetKli.sections, 8, 256),
		sedimentCapacity: finite(options.sedimentCapacity, 0.18, 0, 4),
		sedimentErosion: finite(options.sedimentErosion, 0.65, 0, 5),
		sedimentSettling: finite(options.sedimentSettling, 0.45, 0, 5),
		viscosity: finite(options.viscosity, 0.14, 0, 2),
		vorticityConfinement: finite(options.vorticityConfinement, 0.08, 0, 2)
	});
}

/** Exposes immutable quality choices for editors and diagnostics. */
export function listFluidChannelQualityPresets() {
	return PRESETS;
}

/** Normalizes one finite scalar into a bounded interval. */
function finite(valueOhr, fallbackOhr, minimumOhr, maximumOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr)
		? Math.min(maximumOhr, Math.max(minimumOhr, numberOhr))
		: fallbackOhr;
}

/** Normalizes one bounded integer. */
function integer(valueOhr, fallbackOhr, minimumOhr, maximumOhr) {
	return Math.round(finite(valueOhr, fallbackOhr, minimumOhr, maximumOhr));
}
