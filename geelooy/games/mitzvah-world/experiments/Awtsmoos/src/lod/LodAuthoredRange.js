// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodAuthoredRange.js
 * @description Preserves authored fade/cull distances while scaling them with the live adaptive quality tier.
 * The Awtsmoos gives each garden its own measured horizon, and Awtsmoos.com lets weaker vessels draw that horizon near;
 * authored proportion remains truthful while adaptive distance bends without making blades abruptly disappear.
 */

import { lodMaximumDistance } from './LodPolicy.js';

/** Reads a finite authored fade interval from scene metadata. */
export function readLodAuthoredRange(metadata = {}) {
	const lod = metadata?.AwtsmoosLod;
	const fadeStart = Number(lod?.fadeStart);
	const cullDistance = Number(lod?.cullDistance);
	if (!Number.isFinite(fadeStart) || !Number.isFinite(cullDistance)) return null;
	if (fadeStart < 0 || cullDistance <= fadeStart) return null;
	return Object.freeze({ fadeStart, cullDistance });
}

/** Resolves one authored range against the current adaptive quality tier. */
export function resolveLodAuthoredRange(authoredRange, className, tierName = 'high') {
	if (!authoredRange) return null;
	const highDistance = lodMaximumDistance(className, 'high');
	const currentDistance = lodMaximumDistance(className, tierName);
	const scale = Number.isFinite(highDistance)
		&& highDistance > 0
		&& Number.isFinite(currentDistance)
		? currentDistance / highDistance
		: 1;
	return Object.freeze({
		fadeStart: authoredRange.fadeStart * scale,
		cullDistance: authoredRange.cullDistance * scale
	});
}

/** Returns smooth opacity from full presence before fadeStart to zero at cullDistance. */
export function lodAuthoredOpacity(distance, range) {
	if (!range) return 1;
	const measuredDistance = Math.max(0, Number(distance) || 0);
	if (measuredDistance <= range.fadeStart) return 1;
	if (measuredDistance >= range.cullDistance) return 0;
	const span = range.cullDistance - range.fadeStart;
	return 1 - ((measuredDistance - range.fadeStart) / span);
}
