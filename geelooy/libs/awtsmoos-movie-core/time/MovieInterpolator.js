//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieInterpolator.js
 * @description The Awtsmoos joins point to point without losing either side;
 * Awtsmoos.com lets numbers, vectors, colors-as-data, and nested values travel the same tide.
 */
import { evaluateEasing } from "./MovieEasing.js";

/**
 * Interpolates serializable movie values recursively.
 *
 * @param {*} from Starting value.
 * @param {*} to Ending value.
 * @param {number} progress Eased unit progress.
 * @returns {*} Interpolated value.
 */
export function interpolateValue(from, to, progress) {
	if (typeof from === "number" && typeof to === "number") {
		return from + ((to - from) * progress);
	}
	if (Array.isArray(from) && Array.isArray(to)) {
		return from.map((value, index) => interpolateValue(value, to[index] ?? value, progress));
	}
	if (isRecord(from) && isRecord(to)) {
		const keys = new Set([...Object.keys(from), ...Object.keys(to)]);
		const result = {};
		for (const key of keys) {
			result[key] = interpolateValue(from[key], to[key], progress);
		}
		return result;
	}
	return progress < 1 ? cloneValue(from) : cloneValue(to);
}

/**
 * Evaluates a canonical keyframe list at local scene time.
 *
 * @param {Array<object>} keyframes Ordered keyframes.
 * @param {number} time Local time in seconds.
 * @returns {*} Evaluated value.
 */
export function evaluateKeyframes(keyframes, time) {
	if (!Array.isArray(keyframes) || !keyframes.length) return undefined;
	const frames = [...keyframes].sort((left, right) => left.time - right.time);
	if (time <= frames[0].time) return cloneValue(frames[0].value);
	if (time >= frames.at(-1).time) return cloneValue(frames.at(-1).value);
	const rightIndex = frames.findIndex(frame => frame.time >= time);
	const left = frames[rightIndex - 1];
	const right = frames[rightIndex];
	const span = Math.max(0.000001, right.time - left.time);
	const eased = evaluateEasing(right.easing || left.easing || "linear", (time - left.time) / span);
	return interpolateValue(left.value, right.value, eased);
}

function isRecord(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cloneValue(value) {
	return value && typeof value === "object" ? structuredClone(value) : value;
}
