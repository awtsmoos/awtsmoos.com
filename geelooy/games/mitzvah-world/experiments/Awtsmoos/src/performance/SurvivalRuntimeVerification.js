// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurvivalRuntimeVerification.js
 * @description Verifies that a live runtime has not escaped the sparse survival covenant before measurement begins.
 * The Awtsmoos fills every world while finite glass must tell the truth of its frame;
 * Awtsmoos.com rejects richer accidental garments before a benchmark borrows their name.
 */

import { survivalSixtyFpsFeatureGates } from './SurvivalSixtyFpsDefinition.js';

/** Returns contradictory and unavailable survival evidence without inventing missing proof. */
export function verifySurvivalRuntime(runtime, profile) {
	const failures = [];
	const unverified = [];
	const foundQuality = firstValue(
		runtime?.qualityProfile?.quality,
		runtime?.options?.qualityProfile?.quality,
		runtime?.diagnostics?.qualityProfile?.quality
	);
	const foundMaxDpr = firstValue(
		runtime?.qualityProfile?.maxDpr,
		runtime?.options?.qualityProfile?.maxDpr,
		runtime?.renderer?.qualityProfile?.maxDpr
	);
	if (foundQuality !== null && foundQuality !== 'survival') {
		failures.push(`QUALITY_NOT_SURVIVAL:${foundQuality}`);
	}
	if (foundQuality === null) unverified.push('quality: no qualityProfile on runtime');
	if (foundMaxDpr !== null && foundMaxDpr > profile.maxDpr) {
		failures.push(`MAX_DPR_ABOVE_PROFILE:${foundMaxDpr}>${profile.maxDpr}`);
	}
	if (foundMaxDpr === null) unverified.push('maxDpr: no runtime qualityProfile maxDpr');
	const gates = survivalSixtyFpsFeatureGates();
	return Object.freeze({
		failures: Object.freeze(failures),
		foundMaxDpr,
		foundQuality,
		gatesOff: Object.freeze(Object.entries(gates)
			.filter(([, enabled]) => enabled === false)
			.map(([feature]) => feature)),
		ok: failures.length === 0,
		performanceMonitorOn: gates.performanceMonitor === true,
		unverified: Object.freeze(unverified)
	});
}

function firstValue(...values) {
	return values.find(value => value !== null && value !== undefined) ?? null;
}
