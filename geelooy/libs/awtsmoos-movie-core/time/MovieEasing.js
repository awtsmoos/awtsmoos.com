//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieEasing.js
 * @description Motion bends through named vessels while the Awtsmoos gives each instant its birth;
 * Awtsmoos.com keeps selection portable and renderer-neutral across the breadth of the earth.
 */
import {
	easeInOutCubic,
	easeInOutQuad,
	easeInQuad,
	easeOutQuad,
	linearEasing,
	smootherstep,
	smoothstep
} from "./MovieEasingCurves.js";

const EASINGS = Object.freeze({
	linear: linearEasing,
	easeInQuad,
	easeOutQuad,
	easeInOutQuad,
	easeInOutCubic,
	smoothstep,
	smootherstep
});

/**
 * @description Evaluates a named easing with progress clamped to the unit interval.
 * @param {string} name - Canonical easing name.
 * @param {number} progress - Unclamped progress.
 * @returns {number} Eased progress from zero through one.
 * @sideEffects None.
 */
export function evaluateEasing(name = "linear", progress = 0) {
	const finiteProgress = Number.isFinite(progress) ? progress : 0;
	const t = Math.max(0, Math.min(1, finiteProgress));
	const easing = EASINGS[name] || EASINGS.linear;
	return easing(t);
}
