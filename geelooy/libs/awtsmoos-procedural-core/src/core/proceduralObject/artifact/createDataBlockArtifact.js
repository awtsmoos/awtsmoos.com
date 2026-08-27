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

/**
 * Creates a generic engine-neutral data block.
 *
 * Data blocks model reusable Blender-like datablocks, shader graphs, modifier
 * declarations, safe external identifiers, worlds, simulations, and future
 * engine objects without introducing arbitrary executable source.
 *
 * @param {object} input Data-block declaration.
 * @returns {object} Frozen data block.
 */
export function createDataBlockArtifact(input = {}) {
	if (!input.id || typeof input.id !== "string") {
		throw new Error('B"H | Data blocks require stable ids.');
	}
	if (!input.type || typeof input.type !== "string") {
		throw new Error('B"H | Data blocks require semantic types.');
	}
	return Object.freeze({
		id: input.id,
		type: input.type,
		name: input.name || input.id,
		properties: freezeArtifactValue(input.properties || {}),
		nodes: freezeArtifactValue(input.nodes || []),
		connections: freezeArtifactValue(input.connections || []),
		tags: freezeArtifactValue(input.tags || []),
		metadata: freezeArtifactValue(input.metadata || {})
	});
}
