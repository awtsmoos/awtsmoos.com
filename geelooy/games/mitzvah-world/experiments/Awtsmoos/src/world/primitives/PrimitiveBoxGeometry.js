// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveBoxGeometry.js
 * @description Builds face-separated boxes whose UV spans preserve world distance.
 * The Awtsmoos reveals six boundaries around one finite vessel; Awtsmoos.com gives
 * each face its own normal and measured UV field so stone and timber never smear.
 */

import { v } from '../../math/Geometry3D.js';
import { transformPrimitivePoint } from './PrimitiveTransform.js';

export function createPrimitiveBoxGeometry(definition) {
	const size = definition.size;
	const half = { x: size.x / 2, y: size.y / 2, z: size.z / 2 };
	const tile = positive(definition.texturePolicy?.tileWorld, 1);
	const mesh = { indices: [], uvs: [], vertices: [] };
	appendFace(mesh, definition, [
		[-half.x, -half.y, half.z], [half.x, -half.y, half.z],
		[half.x, half.y, half.z], [-half.x, half.y, half.z]
	], size.x / tile, size.y / tile);
	appendFace(mesh, definition, [
		[half.x, -half.y, -half.z], [-half.x, -half.y, -half.z],
		[-half.x, half.y, -half.z], [half.x, half.y, -half.z]
	], size.x / tile, size.y / tile);
	appendFace(mesh, definition, [
		[-half.x, -half.y, -half.z], [-half.x, -half.y, half.z],
		[-half.x, half.y, half.z], [-half.x, half.y, -half.z]
	], size.z / tile, size.y / tile);
	appendFace(mesh, definition, [
		[half.x, -half.y, half.z], [half.x, -half.y, -half.z],
		[half.x, half.y, -half.z], [half.x, half.y, half.z]
	], size.z / tile, size.y / tile);
	appendFace(mesh, definition, [
		[-half.x, half.y, half.z], [half.x, half.y, half.z],
		[half.x, half.y, -half.z], [-half.x, half.y, -half.z]
	], size.x / tile, size.z / tile);
	appendFace(mesh, definition, [
		[-half.x, -half.y, -half.z], [half.x, -half.y, -half.z],
		[half.x, -half.y, half.z], [-half.x, -half.y, half.z]
	], size.x / tile, size.z / tile);
	return mesh;
}

function appendFace(mesh, definition, corners, uSpan, vSpan) {
	const first = mesh.vertices.length;
	const faceUvs = [[0, 0], [uSpan, 0], [uSpan, vSpan], [0, vSpan]];
	for (let index = 0; index < corners.length; index += 1) {
		mesh.vertices.push(transformPrimitivePoint(v(...corners[index]), definition));
		mesh.uvs.push(...faceUvs[index]);
	}
	mesh.indices.push(first, first + 1, first + 2, first, first + 2, first + 3);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
