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
	const geometry = batchGeometry(boxes);
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

function batchGeometry(boxes) {
	const vertices = [];
	const indices = [];
	for (const box of boxes) appendBox(vertices, indices, box);
	return { indices, vertices };
}

function appendBox(vertices, indices, box) {
	const first = vertices.length;
	const half = {
		x: box.size.x / 2,
		y: box.size.y / 2,
		z: box.size.z / 2
	};
	const corners = [
		[-half.x, -half.y, -half.z], [half.x, -half.y, -half.z],
		[half.x, half.y, -half.z], [-half.x, half.y, -half.z],
		[-half.x, -half.y, half.z], [half.x, -half.y, half.z],
		[half.x, half.y, half.z], [-half.x, half.y, half.z]
	];
	for (const corner of corners) vertices.push(worldPoint(corner, box));
	for (const index of BOX_INDICES) indices.push(first + index);
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

const BOX_INDICES = Object.freeze([
	0, 2, 1, 0, 3, 2,
	4, 5, 6, 4, 6, 7,
	0, 1, 5, 0, 5, 4,
	3, 7, 6, 3, 6, 2,
	1, 2, 6, 1, 6, 5,
	0, 4, 7, 0, 7, 3
]);
