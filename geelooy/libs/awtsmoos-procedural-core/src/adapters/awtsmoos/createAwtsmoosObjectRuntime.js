// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	materializeGeometryArtifact
} from "./materializeGeometryArtifact.js";

/**
 * Builds a renderer-neutral runtime view with typed geometries and traversal.
 *
 * @param {object} artifact Procedural artifact.
 * @returns {object} Awtsmoos runtime view.
 */
export function createAwtsmoosObjectRuntime(artifact) {
	const geometries = Object.fromEntries(
		Object.entries(artifact.geometries || {}).map(([id, geometry]) => [
			id,
			materializeGeometryArtifact(geometry)
		])
	);
	const objects = Object.freeze({...artifact.objects});

	function traverse(visitor, rootIds = artifact.rootObjectIds) {
		const visit = (id, depth) => {
			const object = objects[id];
			if (!object) {
				return;
			}
			visitor(object, {
				depth,
				geometry: object.geometryId
					? geometries[object.geometryId] || null
					: null,
				dataBlock: artifact.dataBlocks?.[object.dataBlockId] || null
			});
			for (const childId of object.children || []) {
				visit(childId, depth + 1);
			}
		};
		for (const id of rootIds) {
			visit(id, 0);
		}
	}

	return Object.freeze({
		schema: "awtsmoos.procedural-object-runtime",
		artifact,
		geometries: Object.freeze(geometries),
		objects,
		dataBlocks: Object.freeze({...artifact.dataBlocks}),
		links: Object.freeze([...(artifact.links || [])]),
		traverse
	});
}
