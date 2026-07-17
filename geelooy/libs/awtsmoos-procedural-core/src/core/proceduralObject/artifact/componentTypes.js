// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	PROCEDURAL_COMPONENT_TYPES
} from "../constants/proceduralObjectContract.js";

const COMPONENT_LIMITS = Object.freeze({
	float32: null,
	float64: null,
	int8: [-128, 127],
	uint8: [0, 255],
	int16: [-32768, 32767],
	uint16: [0, 65535],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295]
});

/**
 * Validates one renderer-neutral numeric array against its declared storage.
 *
 * @param {string} componentType Storage type.
 * @param {number[]} array Numeric values.
 * @returns {number[]} Defensive numeric copy.
 */
export function normalizeComponentArray(componentType, array) {
	if (!PROCEDURAL_COMPONENT_TYPES.includes(componentType)) {
		throw new Error(`B"H | Unsupported component type: ${componentType}`);
	}
	if (!Array.isArray(array)) {
		throw new Error('B"H | Attribute arrays must be plain JSON arrays.');
	}
	const limits = COMPONENT_LIMITS[componentType];

	return array.map((value) => {
		if (!Number.isFinite(value)) {
			throw new Error('B"H | Attribute values must be finite numbers.');
		}
		if (limits && (
			!Number.isInteger(value)
			|| value < limits[0]
			|| value > limits[1]
		)) {
			throw new Error(`B"H | Value exceeds ${componentType} bounds.`);
		}
		return value;
	});
}

/**
 * Selects the smallest safe unsigned index representation.
 *
 * @param {number[]} indices Triangle, line, or point indices.
 * @returns {string} Unsigned component type.
 */
export function inferIndexComponentType(indices) {
	const maximum = Math.max(0, ...indices);
	if (maximum <= 255) {
		return "uint8";
	}
	if (maximum <= 65535) {
		return "uint16";
	}
	return "uint32";
}
