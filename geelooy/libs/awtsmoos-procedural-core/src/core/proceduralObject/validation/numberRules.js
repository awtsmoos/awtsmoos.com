// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	PROCEDURAL_OBJECT_LIMITS
} from "../constants/proceduralObjectContract.js";

/**
 * Recursively rejects non-finite numbers and coordinates beyond safe bounds.
 *
 * @param {*} value Value.
 * @param {string} path Path.
 * @param {object} result Validation result.
 */
export function validateFiniteNumbers(value, path, result) {
	if (Array.isArray(value)) {
		value.forEach((item, index) => {
			validateFiniteNumbers(item, `${path}/${index}`, result);
		});
		return;
	}
	if (value && typeof value === "object") {
		for (const [key, child] of Object.entries(value)) {
			validateFiniteNumbers(child, `${path}/${key}`, result);
		}
		return;
	}
	if (typeof value !== "number") {
		return;
	}
	if (!Number.isFinite(value)) {
		result.addError(path, "Numbers must be finite.");
		return;
	}
	if (Math.abs(value) > PROCEDURAL_OBJECT_LIMITS.maximumAbsoluteCoordinate) {
		result.addError(path, "Number exceeds the procedural safety envelope.");
	}
}
