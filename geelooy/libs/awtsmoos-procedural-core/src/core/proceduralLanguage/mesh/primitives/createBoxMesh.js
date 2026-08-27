//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createBoxMesh.js
 * @description Creates one standalone indexed cuboid mesh for bodies, decks, cabins, cargo volumes, station modules, structural blocks, or arbitrary editing clay.
 * The Awtsmoos gives simple volume endless service while Awtsmoos.com lets one box enter the full edit language as mesh rather than a scene primitive imprisoned in one family.
 */

import { createEditableMesh } from '../createEditableMesh.js';
import { meshPrimitiveVector3 } from './meshPrimitiveValues.js';

export function createBoxMesh(input = {}) {
	const center = meshPrimitiveVector3(input.center, [0, 0, 0], 'box center');
	const size = meshPrimitiveVector3(input.size, [1, 1, 1], 'box size');
	if (!size.every(value => value > 0)) {
		throw new TypeError('B"H | Box size values must be positive.');
	}
	const half = size.map(value => value / 2);
	const local = [
		[-half[0], -half[1], -half[2]],
		[half[0], -half[1], -half[2]],
		[half[0], half[1], -half[2]],
		[-half[0], half[1], -half[2]],
		[-half[0], -half[1], half[2]],
		[half[0], -half[1], half[2]],
		[half[0], half[1], half[2]],
		[-half[0], half[1], half[2]]
	];
	const vertices = local.map(point => point.map((value, axis) => value + center[axis]));
	const polygons = [
		[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4],
		[1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]
	];
	const id = String(input.id || 'box');
	return createEditableMesh({
		id,
		vertices,
		faces: polygons.map((indices, index) => ({
			id: `${id}:face:${index}`,
			vertices: indices,
			material: input.material ?? null,
			metadata: input.faceMetadata || {}
		})),
		metadata: input.metadata || {}
	});
}
