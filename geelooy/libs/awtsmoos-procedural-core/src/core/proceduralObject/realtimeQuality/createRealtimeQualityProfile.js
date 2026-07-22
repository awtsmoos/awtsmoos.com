// B"H
// Boruch Hashem
// Blessed is He
/**
 * Realtime quality is a declared approximation vessel, never a hidden sacrifice.
 * The Awtsmoos renews every frame; Awtsmoos.com exposes stability, work, surface,
 * and secondary-detail limits so preview and cinematic intent share one contract.
 */

export const REALTIME_QUALITY_PROFILES = Object.freeze({
	preview: Object.freeze({
		name: "preview", targetCfl: 1.2, maximumSubsteps: 2,
		maximumParticleTravelRatio: 1, pressureIterations: 10,
		surfaceInterval: 3, secondaryParticleScale: 0.15
	}),
	realtime: Object.freeze({
		name: "realtime", targetCfl: 0.8, maximumSubsteps: 5,
		maximumParticleTravelRatio: 0.65, pressureIterations: 24,
		surfaceInterval: 1, secondaryParticleScale: 0.5
	}),
	high: Object.freeze({
		name: "high", targetCfl: 0.5, maximumSubsteps: 10,
		maximumParticleTravelRatio: 0.4, pressureIterations: 48,
		surfaceInterval: 1, secondaryParticleScale: 1
	}),
	cinematic: Object.freeze({
		name: "cinematic", targetCfl: 0.3, maximumSubsteps: 20,
		maximumParticleTravelRatio: 0.25, pressureIterations: 80,
		surfaceInterval: 1, secondaryParticleScale: 1.8
	})
});

function positive(value, fallback, label) {
	const number = Number(value ?? fallback);
	if (!Number.isFinite(number) || number <= 0) {
		throw new RangeError(`${label} must be a positive finite number.`);
	}
	return number;
}

/**
 * Creates an immutable quality profile from a named preset plus explicit bounds.
 * @param {string|Object} input Preset name or override declaration.
 * @returns {Object} Canonical realtime quality policy.
 * @complexity O(1).
 * @deterministic Always for equal input.
 * @sideEffects None.
 * @failureBehavior Throws for unknown profiles or non-positive bounds.
 */
export function createRealtimeQualityProfile(input = "realtime") {
	const overrides = typeof input === "string" ? {} : input;
	const name = typeof input === "string" ? input : input.name ?? "realtime";
	const preset = REALTIME_QUALITY_PROFILES[name];
	if (!preset) throw new RangeError(`Unknown realtime quality profile: ${name}`);
	return Object.freeze({
		name,
		targetCfl: positive(overrides.targetCfl, preset.targetCfl, "targetCfl"),
		maximumSubsteps: Math.max(1, Math.floor(positive(
			overrides.maximumSubsteps,
			preset.maximumSubsteps,
			"maximumSubsteps"
		))),
		maximumParticleTravelRatio: positive(
			overrides.maximumParticleTravelRatio,
			preset.maximumParticleTravelRatio,
			"maximumParticleTravelRatio"
		),
		pressureIterations: Math.max(1, Math.floor(positive(
			overrides.pressureIterations,
			preset.pressureIterations,
			"pressureIterations"
		))),
		surfaceInterval: Math.max(1, Math.floor(positive(
			overrides.surfaceInterval,
			preset.surfaceInterval,
			"surfaceInterval"
		))),
		secondaryParticleScale: Math.max(0, Number(
			overrides.secondaryParticleScale ?? preset.secondaryParticleScale
		))
	});
}
