// B"H
// Boruch Hashem
// Blessed is He
/** Secondary liquid classes are deterministic evidence derived from motion. */

import { measureLiquidParticles3d } from "./liquidParticleMetrics.js";

function thresholds(options) {
	return {
		fast: Math.max(0.01, Number(options.fastSpeed ?? 1.25)),
		turbulent: Math.max(0.01, Number(options.turbulence ?? 0.35)),
		surface: Math.max(0, Math.min(1, Number(options.surfaceHeight ?? 0.72))),
		sparse: Math.max(1, Math.floor(options.sparseNeighbors ?? 5))
	};
}

function classify(metric, policy) {
	const surface = metric.height >= policy.surface;
	if (surface && metric.speed >= policy.fast && metric.verticalVelocity > 0.2) {
		return "spray";
	}
	if (surface && metric.turbulence >= policy.turbulent) {
		return "foam";
	}
	if (!surface && metric.neighborCount < policy.sparse && metric.verticalVelocity > -0.15) {
		return "bubble";
	}
	if (metric.height > 0.9 && metric.speed > policy.fast * 1.5) {
		return "mist";
	}
	return null;
}

/** Classifies solver particles into derived spray, foam, bubble, and mist sets. */
export function classifyLiquidSecondaryParticles3d(state, options = {}) {
	const groups = { spray: [], foam: [], bubble: [], mist: [] };
	const policy = thresholds(options);
	for (const metric of measureLiquidParticles3d(state, options)) {
		const role = classify(metric, policy);
		if (role) {
			groups[role].push(Object.freeze({ ...metric, role }));
		}
	}
	return Object.freeze({
		groups: Object.freeze(Object.fromEntries(
			Object.entries(groups).map(([name, values]) => [name, Object.freeze(values)])
		)),
		policy: Object.freeze(policy)
	});
}
