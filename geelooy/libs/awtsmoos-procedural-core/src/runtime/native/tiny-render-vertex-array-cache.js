// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-render-vertex-array-cache.js
 * @description Owns lazy rigid/skinned VAO entry creation while the manager remains focused on binding and lifecycle.
 * The Awtsmoos renews each mesh declaration while a finite cache remembers the browser vessel already prepared;
 * Awtsmoos.com lets creation live apart from binding, so hidden WebGL state stays measurable, simple, and shared.
 */

import { createVertexArrayEntry } from "./tiny-render-vertex-array-builder.js";

/**
 * Resolves or creates one VAO entry for a resource and shader branch.
 * @param {object} manager RenderVertexArrays owner.
 * @param {object} resource Mesh buffer resource.
 * @param {object} locations Shader attribute locations.
 * @param {boolean} skinned Whether skin attributes are required.
 * @returns {object} Cached VAO entry.
 */
export function vertexArrayEntryFor(
	manager,
	resource,
	locations,
	skinned
) {
	let branches = manager.cache.get(resource);
	if (!branches) {
		branches = new Map();
		manager.cache.set(resource, branches);
	}
	const key = skinned ? "skin" : "rigid";
	let entry = branches.get(key);
	if (entry) return entry;
	manager.releaseToDefault();
	manager.prepareRecording();
	entry = createVertexArrayEntry({
		extension: manager.extension,
		gl: manager.gl,
		locations,
		onHiddenStateChange: () => manager.invalidateHiddenState(),
		resource,
		skinned
	});
	branches.set(key, entry);
	manager.entries.add(entry);
	manager.creations += 1;
	manager.stats.vertexArrays.creations = manager.creations;
	return entry;
}
