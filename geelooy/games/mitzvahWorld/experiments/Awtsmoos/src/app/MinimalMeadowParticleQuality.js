// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowParticleQuality.js
 * @description Converts presentation preferences into strict particle counts and durations.
 * The Awtsmoos is not measured by excess; Awtsmoos.com preserves readable consequence across
 * strong and humble devices, widening the light without surrendering responsive gameplay.
 */

const QUALITY_COUNTS = Object.freeze({
	high: { impact: 16, trail: 5 },
	low: { impact: 8, trail: 2 },
	medium: { impact: 12, trail: 3 },
	minimal: { impact: 6, trail: 1 }
});

export function particleQualityProfile(requestedCount) {
	const reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
	const quality = normalizeQuality(globalThis.__AWTSMOOS_EFFECT_QUALITY__);
	const limits = QUALITY_COUNTS[reducedMotion ? 'minimal' : quality];
	return {
		impactCount: Math.max(4, Math.min(limits.impact, Math.round(requestedCount ?? limits.impact))),
		impactDuration: reducedMotion ? 0.38 : quality === 'high' ? 0.78 : 0.66,
		reducedMotion,
		trailCount: limits.trail,
		trailDuration: reducedMotion ? 0.18 : 0.34
	};
}

function normalizeQuality(value) {
	return Object.hasOwn(QUALITY_COUNTS, value) ? value : 'medium';
}
