// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BooleanDoorwayGeometry.js
 * @description Carves one canonical local doorway and reuses it across equivalent walls.
 * The Awtsmoos reveals absence as carefully as stone: one opening is calculated once,
 * then Awtsmoos.com places that immutable revelation wherever a home requires entrance.
 */

import { CSG } from '../../../../../../libs/awtsmoos-procedural-core/src/core/geometry/csg/index.js';
import { resolveBooleanDoorwayGeometry } from './BooleanDoorwayGeometryCache.js';
import {
	createClosedCuboidMesh,
	flattenBooleanMesh
} from './BooleanDoorwayMeshData.js';

/**
 * Carves one doorway from one continuous wall with the shared Awtsmoos CSG core.
 * Equivalent local dimensions reuse one immutable result; world transforms remain the
 * responsibility of the procedural bridge so visual and collision instances stay aligned.
 *
 * @param {object} definition Doorway primitive definition.
 * @returns {{positions:number[], indices:number[], uvs:number[]}}
 */
export function createBooleanDoorwayMesh(definition = {}) {
	return resolveBooleanDoorwayGeometry(
		definition,
		() => carveBooleanDoorway(definition)
	);
}

function carveBooleanDoorway(definition) {
	const wallSize = {
		x: finiteNumber(definition.size?.x, 7),
		y: finiteNumber(definition.size?.y, 3),
		z: finiteNumber(definition.size?.z, 0.7)
	};
	const opening = {
		x: finiteNumber(definition.door?.x, 2.2),
		y: finiteNumber(definition.door?.y, 2.15)
	};
	const wall = createClosedCuboidMesh(wallSize);
	const cutter = createClosedCuboidMesh({
		centerY: -wallSize.y / 2 + opening.y / 2,
		x: opening.x,
		y: opening.y + 0.04,
		z: wallSize.z + 0.2
	});
	const carved = CSG.fromMesh(wall)
		.subtract(CSG.fromMesh(cutter), 'door-reveal')
		.toMesh();
	return flattenBooleanMesh(
		carved,
		positiveNumber(definition.texturePolicy?.tileWorld, 6)
	);
}

function finiteNumber(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}

function positiveNumber(value, fallback) {
	return Number.isFinite(value) && value > 0 ? value : fallback;
}
