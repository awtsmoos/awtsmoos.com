//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createPanelPrismMesh.js
 * @description Creates one oriented thin rectangular prism for doors, decks, wings, fins, solar panels, hatches, roofs, control surfaces, and arbitrary editable plates.
 * The Awtsmoos is beyond thickness and normal while Awtsmoos.com lets one finite plane receive depth and direction so transport surfaces remain real polygons within one editable shore.
 */

import { createEditableMesh } from '../createEditableMesh.js';
import {
	createPrimitiveFrame,
	primitivePointAlongFrame
} from './primitiveFrame.js';
import { meshPrimitiveVector3 } from './meshPrimitiveValues.js';

export function createPanelPrismMesh(input = {}) {
	const position = meshPrimitiveVector3(input.position, [0, 0, 0], 'panel position');
	const size = meshPrimitiveVector3(input.size, [1, 0.05, 1], 'panel size');
	if (!size.every(value => value > 0)) {
		throw new TypeError('B"H | Panel size values must be positive.');
	}
	const frame = createPrimitiveFrame(input.normal || [0, 1, 0]);
	const halfWidth = size[0] / 2;
	const halfThickness = size[1] / 2;
	const halfHeight = size[2] / 2;
	const vertices = [];
	for (const normalSign of [-1, 1]) {
		for (const heightSign of [-1, 1]) {
			for (const widthSign of [-1, 1]) {
				vertices.push(primitivePointAlongFrame(
					position,
					frame,
					normalSign * halfThickness,
					widthSign * halfWidth,
					heightSign * halfHeight
				));
			}
		}
	}
	return createEditableMesh({
		id: String(input.id || 'panel'),
		vertices,
		faces: panelFaces(String(input.id || 'panel'), input.material),
		metadata: input.metadata || {}
	});
}

function panelFaces(id, material) {
	const polygons = [
		[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1],
		[2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]
	];
	return polygons.map((vertices, index) => ({
		id: `${id}:face:${index}`,
		vertices,
		material: material ?? null,
		metadata: {}
	}));
}
