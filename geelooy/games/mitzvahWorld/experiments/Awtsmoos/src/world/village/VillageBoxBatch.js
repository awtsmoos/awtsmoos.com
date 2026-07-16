// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBoxBatch.js
 * @description Merges many oriented village boxes into one indexed material definition.
 * The Awtsmoos renews many panes and posts inside one renderer vessel; Awtsmoos.com
 * preserves visible density while refusing one draw definition for every small detail.
 */

export function createVillageBoxBatch(id, boxes, options) {
	const geometry = batchGeometry(boxes, options.texturePolicy?.tileWorld);
	return {
		...geometry,
		color: options.color,
		id: `Awtsmoos_${id}`,
		mapRepeat: options.mapRepeat || [1, 1],
		noEdge: true,
		position: { x: 0, y: 0, z: 0 },
		shape: 'manual',
		solid: false,
		texturePolicy: {
			batchedVillageDetail: true,
			publicFirebase: true,
			...(options.texturePolicy || {})
		},
		textureUrl: options.textureUrl,
		userData: {
			family: options.family,
			instances: boxes.length,
			part: options.part
		}
	};
}

function batchGeometry(boxes, tileWorld) {
	const vertices = [];
	const uvs = [];
	const indices = [];
	for (const box of boxes) appendBox(vertices, uvs, indices, box, tileWorld);
	return { indices, uvs, vertices };
}

function appendBox(vertices, uvs, indices, box, tileWorld) {
	const half = {
		x: box.size.x / 2,
		y: box.size.y / 2,
		z: box.size.z / 2
	};
	const tile = Math.max(0.25, tileWorld || 4);
	appendFace(vertices, uvs, indices, box, [
		[-half.x, -half.y, half.z], [half.x, -half.y, half.z],
		[half.x, half.y, half.z], [-half.x, half.y, half.z]
	], box.size.x / tile, box.size.y / tile);
	appendFace(vertices, uvs, indices, box, [
		[half.x, -half.y, -half.z], [-half.x, -half.y, -half.z],
		[-half.x, half.y, -half.z], [half.x, half.y, -half.z]
	], box.size.x / tile, box.size.y / tile);
	appendFace(vertices, uvs, indices, box, [
		[-half.x, -half.y, -half.z], [-half.x, -half.y, half.z],
		[-half.x, half.y, half.z], [-half.x, half.y, -half.z]
	], box.size.z / tile, box.size.y / tile);
	appendFace(vertices, uvs, indices, box, [
		[half.x, -half.y, half.z], [half.x, -half.y, -half.z],
		[half.x, half.y, -half.z], [half.x, half.y, half.z]
	], box.size.z / tile, box.size.y / tile);
	appendFace(vertices, uvs, indices, box, [
		[-half.x, half.y, half.z], [half.x, half.y, half.z],
		[half.x, half.y, -half.z], [-half.x, half.y, -half.z]
	], box.size.x / tile, box.size.z / tile);
	appendFace(vertices, uvs, indices, box, [
		[-half.x, -half.y, -half.z], [half.x, -half.y, -half.z],
		[half.x, -half.y, half.z], [-half.x, -half.y, half.z]
	], box.size.x / tile, box.size.z / tile);
}

function appendFace(vertices, uvs, indices, box, corners, uSpan, vSpan) {
	const first = vertices.length;
	const faceUvs = [[0, 0], [uSpan, 0], [uSpan, vSpan], [0, vSpan]];
	for (let index = 0; index < corners.length; index += 1) {
		vertices.push(worldPoint(corners[index], box));
		uvs.push(...faceUvs[index]);
	}
	indices.push(
		first, first + 1, first + 2,
		first, first + 2, first + 3
	);
}

function worldPoint(corner, box) {
	const yaw = box.yaw || 0;
	const cosine = Math.cos(yaw);
	const sine = Math.sin(yaw);
	return [
		box.position.x + corner[0] * cosine + corner[2] * sine,
		box.position.y + corner[1],
		box.position.z - corner[0] * sine + corner[2] * cosine
	];
}
