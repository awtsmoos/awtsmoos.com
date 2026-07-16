// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverSurfaceGeometry.js
 * @description Builds one closed translucent river volume from the shared hydrology profile.
 * The Awtsmoos wraps moving light around depth and current; Awtsmoos.com replaces a
 * plastic ribbon with a bank-to-bank volume carrying flow direction and measurable drop.
 */

export function createRiverSurfaceGeometry(profile) {
	const vertices = [];
	const faces = [];
	const uvs = [];
	for (const [index, point] of profile.points.entries()) {
		appendCrossSection(vertices, uvs, point, index);
	}
	for (let index = 0; index < profile.points.length - 1; index += 1) {
		appendSectionFaces(faces, index * 4);
	}
	faces.push([0, 1, 3, 2]);
	const end = vertices.length - 4;
	faces.push([end, end + 2, end + 3, end + 1]);
	return { faces, uvs, vertices };
}

function appendCrossSection(vertices, uvs, point, index) {
	const halfWidth = point.width;
	const depth = 0.72 + point.width * 0.08;
	const leftX = point.x - point.normal.x * halfWidth;
	const leftZ = point.z - point.normal.z * halfWidth;
	const rightX = point.x + point.normal.x * halfWidth;
	const rightZ = point.z + point.normal.z * halfWidth;
	vertices.push(
		[leftX, point.y, leftZ],
		[rightX, point.y, rightZ],
		[leftX, point.y - depth, leftZ],
		[rightX, point.y - depth, rightZ]
	);
	const longitudinal = index / 4.5;
	uvs.push(longitudinal, 0, longitudinal, 1, longitudinal, 0, longitudinal, 1);
}

function appendSectionFaces(faces, start) {
	const next = start + 4;
	faces.push([start, next, next + 1, start + 1]);
	faces.push([start + 2, start + 3, next + 3, next + 2]);
	faces.push([start, start + 2, next + 2, next]);
	faces.push([start + 1, next + 1, next + 3, start + 3]);
}
