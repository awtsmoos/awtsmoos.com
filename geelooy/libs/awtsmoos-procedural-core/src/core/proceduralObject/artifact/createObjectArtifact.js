// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	freezeArtifactValue
} from "./freezeArtifactValue.js";

const DEFAULT_TRANSFORM = Object.freeze({
	position: [0, 0, 0],
	rotation: [0, 0, 0, 1],
	scale: [1, 1, 1]
});

/**
 * Creates one scene-graph object without binding it to a rendering engine.
 *
 * @param {object} input Object declaration.
 * @returns {object} Frozen scene object.
 */
export function createObjectArtifact(input = {}) {
	if (!input.id) {
		throw new Error('B"H | Scene objects require stable ids.');
	}
	return Object.freeze({
		id: input.id,
		type: input.type || "mesh",
		name: input.name || input.id,
		parentId: input.parentId ?? input.parent_id ?? null,
		children: freezeArtifactValue(input.children || []),
		geometryId: input.geometryId ?? input.geometry_id ?? null,
		dataBlockId: input.dataBlockId ?? input.data_block_id ?? null,
		materialIds: freezeArtifactValue(
			input.materialIds || input.material_ids || []
		),
		transform: freezeArtifactValue({
			...DEFAULT_TRANSFORM,
			...(input.transform || {})
		}),
		visible: input.visible !== false,
		layers: freezeArtifactValue(input.layers || []),
		tags: freezeArtifactValue(input.tags || []),
		constraints: freezeArtifactValue(input.constraints || []),
		metadata: freezeArtifactValue(input.metadata || {})
	});
}
