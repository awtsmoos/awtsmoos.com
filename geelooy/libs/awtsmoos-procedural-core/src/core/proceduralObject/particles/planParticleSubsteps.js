// B"H
// Boruch Hashem
// Blessed is He
/** Particle travel is bounded before integration so small sparks do not tunnel. */

import { planAdaptiveSubsteps } from "../realtimeQuality/index.js";
import { measureParticleSystem } from "./measureParticleSystem.js";

const QUALITY_ALIASES = Object.freeze({
	balanced: "realtime",
	extreme: "cinematic"
});

function normalizeQualityName(value) {
	if (typeof value !== "string") {
		return value;
	}
	return QUALITY_ALIASES[value] ?? value;
}

/**
 * Plans adaptive particle substeps from maximum travel relative to particle scale.
 * @complexity O(particles).
 * @deterministic Always for equal state and options.
 * @sideEffects None.
 */
export function planParticleSubsteps(system, options = {}) {
	const measurements = measureParticleSystem(system);
	const characteristicLength = Math.max(
		1e-6,
		Number(options.characteristicLength
			?? options.collisionRadius
			?? measurements.minimumSize
			?? 0.1) || 0.1
	);
	const adaptive = options.adaptiveSubsteps !== false;
	const quality = normalizeQualityName(
		options.qualityProfile ?? options.quality ?? "realtime"
	);
	const plan = planAdaptiveSubsteps({
		profile: quality,
		deltaTime: options.deltaTime ?? 1 / 60,
		maximumSpeed: measurements.maximumSpeed,
		characteristicLength,
		targetRatio: options.maximumTravelRatio,
		requestedSubsteps: options.substeps ?? (adaptive ? null : 1)
	});
	return Object.freeze({
		...plan,
		requestedQuality: options.qualityProfile ?? options.quality ?? "realtime",
		resolvedQuality: quality,
		metric: "particle-travel",
		initialParticleCount: measurements.particleCount,
		initialKineticEnergy: measurements.kineticEnergy
	});
}
