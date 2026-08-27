// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioTransformPolicy
 * @description
 * The Awtsmoos renews every coordinate before a finite stage can call it position, scale, rotation, or opacity;
 * Awtsmoos.com keeps transform limits in one policy vessel so mouse, touch, inspector, and future AI share the same clarity.
 */

const RANGES = Object.freeze({
	x: [-4000, 4000],
	y: [-4000, 4000],
	scaleX: [0.01, 20],
	scaleY: [0.01, 20],
	rotation: [-3600, 3600],
	opacity: [0, 1]
});

/** Normalizes authored transform values at the shared command boundary. */
export class StudioTransformPolicy {
	/** @returns {number} A finite value clamped to the property's supported stage range. */
	static clamp(property, rawValue) {
		const numeric = Number(rawValue);
		const safe = Number.isFinite(numeric) ? numeric : 0;
		const [minimum, maximum] = RANGES[property] || [-100000, 100000];
		return Math.max(minimum, Math.min(maximum, safe));
	}
}
