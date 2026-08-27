// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	inferIndexComponentType,
	normalizeComponentArray
} from "./componentTypes.js";

/**
 * Creates a renderer-neutral index artifact.
 *
 * @param {object|number[]} input Index declaration or raw index array.
 * @returns {object|null} Frozen index artifact, or null for non-indexed geometry.
 */
export function createIndexArtifact(input) {
	if (input === null || input === undefined) {
		return null;
	}
	const declaration = Array.isArray(input)
		? {
			array: input
		}
		: input;
	const rawArray = declaration.array || [];
	const componentType = declaration.componentType
		?? declaration.component_type
		?? inferIndexComponentType(rawArray);
	const array = normalizeComponentArray(componentType, rawArray);
	if (array.some((value) => value < 0)) {
		throw new Error('B"H | Geometry indices cannot be negative.');
	}
	return Object.freeze({
		componentType,
		array
	});
}
