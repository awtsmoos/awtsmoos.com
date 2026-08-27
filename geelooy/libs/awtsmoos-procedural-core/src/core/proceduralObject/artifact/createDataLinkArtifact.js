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
 * Creates one inspectable relationship between arbitrary data blocks.
 *
 * @param {object} input Link declaration.
 * @returns {object} Frozen relationship.
 */
export function createDataLinkArtifact(input = {}) {
	if (!input.id || !input.from || !input.to || !input.kind) {
		throw new Error('B"H | Data links require id, from, to, and kind.');
	}
	return Object.freeze({
		id: input.id,
		from: input.from,
		to: input.to,
		kind: input.kind,
		fromSocket: input.fromSocket ?? input.from_socket ?? null,
		toSocket: input.toSocket ?? input.to_socket ?? null,
		properties: freezeArtifactValue(input.properties || {}),
		metadata: freezeArtifactValue(input.metadata || {})
	});
}
