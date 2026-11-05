//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file CreatureGeometryStreams.js
 * @description Produces renderer-neutral indexed streams for reusable smooth creature spheres and tapered limbs.
 * This module owns only deterministic numeric topology. It never imports a renderer, allocates native geometry,
 * chooses materials, or mutates scene hierarchy, which keeps procedural anatomy portable to workers and Core.
 */

/**
 * Creates one UV-mapped unit sphere as portable arrays.
 * @param {number} segments Longitudinal subdivisions.
 * @param {number} rings Latitudinal subdivisions.
 * @returns {{indices:number[],normals:number[],positions:number[],uvs:number[]}} Portable sphere streams.
 */
export function createCreatureSphereStreams(segments, rings) {
	const data = emptyStreams();
	for (let ring = 0; ring <= rings; ring += 1) {
		const v = ring / rings;
		const phi = v * Math.PI;
		for (let segment = 0; segment <= segments; segment += 1) {
			const u = segment / segments;
			const theta = u * Math.PI * 2;
			const x = Math.sin(phi) * Math.cos(theta);
			const y = Math.cos(phi);
			const z = Math.sin(phi) * Math.sin(theta);
			pushVertex(data, x, y, z, x, y, z, u, 1 - v);
		}
	}
	appendGridIndices(data.indices, rings, segments);
	return data;
}

/**
 * Creates one tapered unit limb with closed end caps as portable indexed streams.
 * @param {number} segments Circumferential subdivisions.
 * @param {number} topRadius Radius ratio at the upper ring.
 * @returns {{indices:number[],normals:number[],positions:number[],uvs:number[]}} Portable limb streams.
 */
export function createCreatureLimbStreams(segments, topRadius) {
	const data = emptyStreams();
	for (let row = 0; row <= 1; row += 1) {
		const radius = row ? topRadius : 1;
		const y = row - 0.5;
		for (let segment = 0; segment <= segments; segment += 1) {
			const u = segment / segments;
			const angle = u * Math.PI * 2;
			const x = Math.cos(angle) * radius;
			const z = Math.sin(angle) * radius;
			pushVertex(data, x, y, z, Math.cos(angle), 0.2, Math.sin(angle), u, row);
		}
	}
	appendGridIndices(data.indices, 1, segments);
	appendCap(data, segments, -0.5, 1, true);
	appendCap(data, segments, 0.5, topRadius, false);
	return data;
}
/** Appends one closed radial cap while preserving winding and normal direction. */
function appendCap(data, segments, y, radius, reverse) {
	const center = data.positions.length / 3;
	pushVertex(data, 0, y, 0, 0, reverse ? -1 : 1, 0, 0.5, 0.5);
	for (let segment = 0; segment <= segments; segment += 1) {
		const angle = segment / segments * Math.PI * 2;
		pushVertex(
			data,
			Math.cos(angle) * radius,
			y,
			Math.sin(angle) * radius,
			0,
			reverse ? -1 : 1,
			0,
			0.5,
			0.5
		);
		if (segment) {
			const first = center + segment;
			data.indices.push(...(reverse
				? [center, first + 1, first]
				: [center, first, first + 1]));
		}
	}
}

/** Appends two triangles for every cell in a regular row/segment surface grid. */
function appendGridIndices(indices, rows, segments) {
	for (let row = 0; row < rows; row += 1) {
		for (let segment = 0; segment < segments; segment += 1) {
			const first = row * (segments + 1) + segment;
			const next = first + segments + 1;
			indices.push(first, next, first + 1, first + 1, next, next + 1);
		}
	}
}
/** Appends one complete position, normal, and UV tuple to the shared portable vessel. */
function pushVertex(data, x, y, z, nx, ny, nz, u, v) {
	data.positions.push(x, y, z);
	data.normals.push(nx, ny, nz);
	data.uvs.push(u, v);
}

/** Creates isolated mutable streams for one geometry build before Core materialization. */
function emptyStreams() {
	return {
		indices: [],
		normals: [],
		positions: [],
		uvs: []
	};
}
