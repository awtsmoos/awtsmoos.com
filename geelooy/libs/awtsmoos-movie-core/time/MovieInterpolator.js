//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieInterpolator.js
 * @description The Awtsmoos gives every keyframe its measured place while nested values flow through a focused companion;
 * Awtsmoos.com keeps time and value interpolation distinct, so each vessel remains small, testable, and radiant.
 */
import { evaluateEasing } from "./MovieEasing.js";
import { interpolateValue } from "./MovieValueInterpolator.js";

export { interpolateValue };

/**
 * @description Evaluates a canonical keyframe list at local scene time.
 * @param {Array<object>} keyframes - Canonical keyframes.
 * @param {number} time - Local scene time in seconds.
 * @returns {*} Evaluated value or undefined for an empty collection.
 * @sideEffects None.
 */
export function evaluateKeyframes(keyframes, time) {
	if (!Array.isArray(keyframes) || keyframes.length === 0) {
		return undefined;
	}
	const frames = [...keyframes].sort(compareFrameTime);
	if (time <= frames[0].time) {
		return cloneValue(frames[0].value);
	}
	const lastFrame = frames.at(-1);
	if (time >= lastFrame.time) {
		return cloneValue(lastFrame.value);
	}
	const rightIndex = findRightFrameIndex(frames, time);
	const left = frames[rightIndex - 1];
	const right = frames[rightIndex];
	const span = Math.max(0.000001, right.time - left.time);
	const progress = (time - left.time) / span;
	const easingName = right.easing || left.easing || "linear";
	const eased = evaluateEasing(easingName, progress);
	return interpolateValue(left.value, right.value, eased);
}

/**
 * @description Finds the first keyframe whose time is at or after the requested local time.
 * @param {Array<object>} frames - Time-sorted keyframes.
 * @param {number} time - Requested local scene time.
 * @returns {number} Index of the right interpolation keyframe.
 * @sideEffects None.
 */
function findRightFrameIndex(frames, time) {
	for (let index = 1; index < frames.length; index += 1) {
		if (frames[index].time >= time) {
			return index;
		}
	}
	return frames.length - 1;
}

/**
 * @description Orders canonical keyframes by ascending time.
 * @param {object} left - Left keyframe.
 * @param {object} right - Right keyframe.
 * @returns {number} Array sort comparison result.
 * @sideEffects None.
 */
function compareFrameTime(left, right) {
	return left.time - right.time;
}

/**
 * @description Clones object-like values while preserving primitives directly.
 * @param {*} value - Candidate serializable value.
 * @returns {*} Detached clone or original primitive.
 * @sideEffects Allocates a clone for object-like values.
 */
function cloneValue(value) {
	if (value && typeof value === "object") {
		return structuredClone(value);
	}
	return value;
}
