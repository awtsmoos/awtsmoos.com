// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingRoofSolids.js
 * @description Builds small watertight local-space solids for gable, hip, and shed roof grammars.
 * The Awtsmoos renews ridge, eave, and shelter before one face is triangulated; Awtsmoos.com lets these finite solids
 * carry true architectural volume while renderers remain free to triangulate, shade, texture, or simplify their garment.
 */

/** Creates one watertight local-space roof solid. */
export function createBuildingRoofSolid(type, width, depth, baseY, rise, thickness) {
	if (type === 'gable') return gable(width, depth, baseY, rise, thickness);
	if (type === 'shed') return shed(width, depth, baseY, rise, thickness);
	return hip(width, depth, baseY, rise, thickness);
}

function hip(width, depth, baseY, rise, thickness) {
	const top = corners(width, depth, baseY);
	const bottom = corners(width, depth, baseY - thickness);
	const apex = [0, baseY + rise, 0];
	const vertices = [...top, apex, ...bottom];
	const faces = [];
	for (let side = 0; side < 4; side += 1) {
		const next = (side + 1) % 4;
		faces.push([side, next, 4]);
		faces.push([side, 5 + side, 5 + next, next]);
	}
	faces.push([8, 7, 6, 5]);
	return freezeMesh(vertices, faces);
}

function gable(width, depth, baseY, rise, thickness) {
	const halfWidth = width / 2;
	const halfDepth = depth / 2;
	const vertices = [
		[-halfWidth, baseY, halfDepth],
		[halfWidth, baseY, halfDepth],
		[halfWidth, baseY, -halfDepth],
		[-halfWidth, baseY, -halfDepth],
		[0, baseY + rise, halfDepth],
		[0, baseY + rise, -halfDepth],
		[-halfWidth, baseY - thickness, halfDepth],
		[halfWidth, baseY - thickness, halfDepth],
		[halfWidth, baseY - thickness, -halfDepth],
		[-halfWidth, baseY - thickness, -halfDepth]
	];
	return freezeMesh(vertices, [
		[0, 3, 5, 4],
		[4, 5, 2, 1],
		[0, 4, 1],
		[3, 2, 5],
		[9, 8, 7, 6],
		[0, 6, 9, 3],
		[1, 2, 8, 7]
	]);
}

function shed(width, depth, baseY, rise, thickness) {
	const halfWidth = width / 2;
	const halfDepth = depth / 2;
	const top = [
		[-halfWidth, baseY + rise, halfDepth],
		[halfWidth, baseY, halfDepth],
		[halfWidth, baseY, -halfDepth],
		[-halfWidth, baseY + rise, -halfDepth]
	];
	const bottom = top.map(point => [point[0], baseY - thickness, point[2]]);
	return freezeMesh([...top, ...bottom], [
		[0, 3, 2, 1],
		[7, 4, 5, 6],
		[0, 1, 5, 4],
		[1, 2, 6, 5],
		[2, 3, 7, 6],
		[3, 0, 4, 7]
	]);
}

function corners(width, depth, y) {
	const halfWidth = width / 2;
	const halfDepth = depth / 2;
	return [
		[-halfWidth, y, halfDepth],
		[halfWidth, y, halfDepth],
		[halfWidth, y, -halfDepth],
		[-halfWidth, y, -halfDepth]
	];
}

function freezeMesh(vertices, faces) {
	return Object.freeze({
		faces: Object.freeze(faces.map(face => Object.freeze(face))),
		vertices: Object.freeze(vertices.map(vertex => Object.freeze(vertex)))
	});
}
