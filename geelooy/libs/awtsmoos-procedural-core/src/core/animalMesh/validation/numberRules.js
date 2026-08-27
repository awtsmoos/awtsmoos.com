// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	ANIMAL_MESH_LIMITS
} from "../constants/animalMeshContract.js";

const POSITIVE_NAME_PATTERN = /(radius|width|height|depth|length|segments|count)$/i;
const COORDINATE_KEY_PATTERN = /(center|head|tail|position|point|landmark|centerline)/i;

/**
 * Finds non-finite, negative-dimension, and unsafe-coordinate numbers.
 *
 * @param {*} value Value being inspected.
 * @param {string} path JSON-like path.
 * @param {Array<Object>} issues Accumulated issues.
 * @returns {Array<Object>} Numeric issues.
 */
export function collectNumericIssues(value, path = "", issues = []) {
	if (Array.isArray(value)) {
		value.forEach((item, index) => {
			collectNumericIssues(item, `${path}/${index}`, issues);
		});
		return issues;
	}
	if (!value || typeof value !== "object") {
		if (typeof value === "number" && !Number.isFinite(value)) {
			issues.push({
				path,
				message: "Numbers must be finite."
			});
		}
		return issues;
	}
	for (const [key, item] of Object.entries(value)) {
		const childPath = `${path}/${key}`;
		if (typeof item === "number") {
			if (!Number.isFinite(item)) {
				issues.push({
					path: childPath,
					message: "Numbers must be finite."
				});
			}
			if (POSITIVE_NAME_PATTERN.test(key) && item < 0) {
				issues.push({
					path: childPath,
					message: "Dimensions and segment counts cannot be negative."
				});
			}
			if (
				COORDINATE_KEY_PATTERN.test(path) &&
				Math.abs(item) > ANIMAL_MESH_LIMITS.maximumAbsoluteCoordinate
			) {
				issues.push({
					path: childPath,
					message: "Coordinate exceeds the safe absolute bound."
				});
			}
		}
		collectNumericIssues(item, childPath, issues);
	}
	return issues;
}
