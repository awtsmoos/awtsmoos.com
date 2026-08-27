// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	createAwtsmoosComponentArray
} from "./componentArrayFactory.js";

/**
 * Materializes a portable geometry artifact for any Awtsmoos runtime.
 *
 * The result is still renderer-neutral: it exposes typed arrays and metadata,
 * but never imports Three.js, WebGL, Blender, Babylon, or another engine.
 *
 * @param {object} geometry Portable geometry artifact.
 * @returns {object} Runtime geometry view.
 */
export function materializeGeometryArtifact(geometry) {
	const attributes = {};
	for (const [name, attribute] of Object.entries(geometry.attributes || {})) {
		attributes[name] = Object.freeze({
			...attribute,
			array: createAwtsmoosComponentArray(
				attribute.componentType,
				attribute.array
			)
		});
	}
	const indices = geometry.indices
		? Object.freeze({
			...geometry.indices,
			array: createAwtsmoosComponentArray(
				geometry.indices.componentType,
				geometry.indices.array
			)
		})
		: null;
	return Object.freeze({
		...geometry,
		attributes: Object.freeze(attributes),
		indices
	});
}
