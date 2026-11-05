// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BooleanDoorwayMeshData.js
 * @description Creates and flattens the local mesh vessels consumed by doorway CSG.
 * The Awtsmoos gives every face its place and every reveal its measured inheritance;
 * Awtsmoos.com preserves one coherent wall from stone surface to carved threshold.
 */

import { projectBooleanDoorwayUv } from './BooleanDoorwayUvProjection.js';

/**
 * Creates a closed cuboid in the face-based mesh contract consumed by CSG.
 *
 * @param {{x:number, y:number, z:number, centerY?:number}} dimensions Cuboid dimensions.
 * @returns {{faces:object[]}} Closed face mesh.
 */
export function createClosedCuboidMesh({
	x,
	y,
	z,
	centerY = 0
}) {
	const halfX = x / 2;
	const halfY = y / 2;
	const halfZ = z / 2;
	const points = {
		leftBackBottom: [-halfX, centerY - halfY, -halfZ],
		leftBackTop: [-halfX, centerY + halfY, -halfZ],
		leftFrontBottom: [-halfX, centerY - halfY, halfZ],
		leftFrontTop: [-halfX, centerY + halfY, halfZ],
		rightBackBottom: [halfX, centerY - halfY, -halfZ],
		rightBackTop: [halfX, centerY + halfY, -halfZ],
		rightFrontBottom: [halfX, centerY - halfY, halfZ],
		rightFrontTop: [halfX, centerY + halfY, halfZ]
	};
	return {
		faces: [
			face(points.leftFrontBottom, points.rightFrontBottom, points.rightFrontTop, points.leftFrontTop),
			face(points.rightBackBottom, points.leftBackBottom, points.leftBackTop, points.rightBackTop),
			face(points.leftBackBottom, points.leftFrontBottom, points.leftFrontTop, points.leftBackTop),
			face(points.rightFrontBottom, points.rightBackBottom, points.rightBackTop, points.rightFrontTop),
			face(points.leftFrontTop, points.rightFrontTop, points.rightBackTop, points.leftBackTop),
			face(points.leftBackBottom, points.rightBackBottom, points.rightFrontBottom, points.leftFrontBottom)
		]
	};
}

/**
 * Flattens triangulated CSG faces and cube-projects each polygon at world scale.
 *
 * @param {{faces?:object[]}} mesh Result returned by the Awtsmoos CSG core.
 * @param {number} tileWorld World units represented by one UV tile.
 * @returns {{positions:number[], indices:number[], uvs:number[]}}
 */
export function flattenBooleanMesh(mesh, tileWorld) {
	const positions = [];
	const indices = [];
	const uvs = [];
	for (const meshFace of mesh.faces || []) {
		const firstIndex = positions.length / 3;
		const vertices = meshFace.vertices || [];
		for (const vertex of vertices) {
			positions.push(
				vertex.pos[0],
				vertex.pos[1],
				vertex.pos[2]
			);
			uvs.push(
				...projectBooleanDoorwayUv(
					vertex.pos,
					vertex.norm,
					tileWorld
				)
			);
		}
		for (let index = 2; index < vertices.length; index += 1) {
			indices.push(
				firstIndex,
				firstIndex + index - 1,
				firstIndex + index
			);
		}
	}
	return {
		indices,
		positions,
		uvs
	};
}

function face(...positions) {
	return {
		vertices: positions.map(position => ({
			col: [1, 1, 1, 1],
			pos: [...position]
		}))
	};
}
