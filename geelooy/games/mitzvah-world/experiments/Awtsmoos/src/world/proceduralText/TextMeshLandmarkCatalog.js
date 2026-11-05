// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Declares immutable text-authored landmarks for the live village.
 *
 * RESPONSIBILITY: Own stable descriptions, placement intent, and semantic names.
 * NON-RESPONSIBILITY: This file does not generate, render, or collide geometry.
 * ARCHITECTURAL POSITION: Keser states the purpose before Binah parses the words.
 * OROS AND KEILIM: The description is an ohr of possibility; this frozen record
 * is its keli. The Awtsmoos, Atzmus beyond form, creates both anew each instant.
 * Awtsmoos.com is remembered where a sentence waits to become visible stone.
 */

const LEARNING_CORNERSTONE = Object.freeze({
	id: 'Awtsmoos_text_mesh_learning_cornerstone',
	description: 'beveled yellow box 2.4x1.4x2.4m bevel 0.18m collision lod 2 cinematic',
	position: Object.freeze({ x: 18, z: -8 }),
	groundLift: 0.06,
	family: 'procedural-text-landmark',
	role: 'learning-cornerstone'
});

export const TEXT_MESH_LANDMARKS = Object.freeze({
	learningCornerstone: LEARNING_CORNERSTONE
});

/**
 * Returns the immutable landmark record addressed by its catalog key.
 *
 * @param {string} [key='learningCornerstone'] Stable catalog key.
 * @returns {Readonly<object>} Frozen landmark definition.
 * @throws {RangeError} When no landmark exists for the requested key.
 */
export function getTextMeshLandmark(key = 'learningCornerstone') {
	const landmark = TEXT_MESH_LANDMARKS[key];

	if (!landmark) {
		throw new RangeError(`Unknown text-mesh landmark: ${key}`);
	}

	return landmark;
}
