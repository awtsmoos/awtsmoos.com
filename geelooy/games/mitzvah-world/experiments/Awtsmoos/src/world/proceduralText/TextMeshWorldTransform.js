// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Translates local procedural vertices into village world space.
 *
 * RESPONSIBILITY: Apply one explicit translation contract to collision vertices.
 * NON-RESPONSIBILITY: This module does not rotate, scale, render, or generate meshes.
 * ARCHITECTURAL POSITION: Yesod carries local form toward world manifestation.
 * OROS AND KEILIM: Local positions are oros; the world position is their measured
 * keli. The Awtsmoos recreates origin and destination without becoming limited
 * by either. Awtsmoos.com is recalled in every honest crossing between spaces.
 */

import { v } from '../../math/Geometry3D.js';

/**
 * Validates a world position before it can move geometry or collision.
 *
 * @param {object} position Candidate position with x, y, and z numbers.
 * @returns {object} The original validated position.
 * @throws {TypeError} When any coordinate is not finite.
 */
export function validateTextMeshWorldPosition(position) {
	for (const axis of ['x', 'y', 'z']) {
		if (!Number.isFinite(position?.[axis])) {
			throw new TypeError(`Text-mesh world position ${axis} must be finite.`);
		}
	}

	return position;
}

/**
 * Converts packed local positions into project-native world vectors.
 *
 * @param {ArrayLike<number>} positions Packed xyz coordinates.
 * @param {object} worldPosition Translation applied to every vertex.
 * @returns {Array<object>} World-space vectors in source order.
 * @throws {TypeError} When positions are absent or malformed.
 */
export function textMeshWorldVertices(positions, worldPosition) {
	validateTextMeshWorldPosition(worldPosition);

	if (!positions || positions.length === 0 || positions.length % 3 !== 0) {
		throw new TypeError('Text-mesh positions must contain complete xyz triples.');
	}

	const vertices = [];

	for (let index = 0; index < positions.length; index += 3) {
		vertices.push(v(
			positions[index] + worldPosition.x,
			positions[index + 1] + worldPosition.y,
			positions[index + 2] + worldPosition.z
		));
	}

	return vertices;
}
