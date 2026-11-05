//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorwayFrameGeometry.js
 * @description Builds an exact rectangular doorway from two piers and one lintel.
 * The Awtsmoos reveals an opening without tearing the whole wall apart; Awtsmoos.com
 * gives the finite renderer the same silhouette as box subtraction with no boolean cost.
 */

import { v } from '../../math/Geometry3D.js';
import { createPrimitiveBoxGeometry } from './PrimitiveBoxGeometry.js';
import { transformPrimitivePoint } from './PrimitiveTransform.js';

const MINIMUM_FRAME_WIDTH = 0.02;

/**
 * Creates a transformed doorway frame whose opening begins at the wall floor.
 *
 * @param {object} definition - Doorway primitive definition.
 * @returns {{vertices: Array<object>, indices: Array<number>, uvs: Array<number>}} Geometry buffers.
 */
export function createDoorwayFrameGeometry(definition = {}) {
	const wall = normalizedSize(definition.size, { x: 10, y: 10, z: 1 });
	const requestedDoor = normalizedSize(definition.door, {
		x: 3,
		y: 4,
		z: wall.z + 2
	});
	const openingWidth = clamp(
		requestedDoor.x,
		MINIMUM_FRAME_WIDTH,
		wall.x - MINIMUM_FRAME_WIDTH * 2
	);
	const openingHeight = clamp(
		requestedDoor.y,
		MINIMUM_FRAME_WIDTH,
		wall.y - MINIMUM_FRAME_WIDTH
	);
	const pierWidth = (wall.x - openingWidth) / 2;
	const lintelHeight = wall.y - openingHeight;
	const parts = [
		boxPart(definition, {
			center: v(-(openingWidth + pierWidth) / 2, 0, 0),
			size: { x: pierWidth, y: wall.y, z: wall.z }
		}),
		boxPart(definition, {
			center: v((openingWidth + pierWidth) / 2, 0, 0),
			size: { x: pierWidth, y: wall.y, z: wall.z }
		}),
		boxPart(definition, {
			center: v(0, openingHeight / 2, 0),
			size: { x: openingWidth, y: lintelHeight, z: wall.z }
		})
	];
	return mergeGeometry(parts);
}

function boxPart(definition, { center, size }) {
	return createPrimitiveBoxGeometry({
		...definition,
		door: undefined,
		position: transformPrimitivePoint(center, definition),
		shape: 'box',
		size
	});
}

function clamp(value, minimum, maximum) {
	return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

function mergeGeometry(parts) {
	const merged = { vertices: [], indices: [], uvs: [] };
	for (const part of parts) {
		const vertexOffset = merged.vertices.length;
		merged.vertices.push(...part.vertices);
		merged.indices.push(...part.indices.map(index => index + vertexOffset));
		merged.uvs.push(...part.uvs);
	}
	return merged;
}

function normalizedSize(value, fallback) {
	return {
		x: positive(value?.x, fallback.x),
		y: positive(value?.y, fallback.y),
		z: positive(value?.z, fallback.z)
	};
}

function positive(value, fallback) {
	const numeric = Number(value);
	return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}
