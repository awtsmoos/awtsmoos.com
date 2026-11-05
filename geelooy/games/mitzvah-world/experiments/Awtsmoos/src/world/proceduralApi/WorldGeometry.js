// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGeometry.js
 * @description Small truthful geometry vessels shared by terrain, rivers, and wells.
 */
export function createWorldGeometry(role = 'body') {
	return { faces: [], normals: [], role, uvs: [], vertices: [] };
}

export function addTriangle(geometry, a, b, c, uvs = null) {
	const base = geometry.vertices.length;
	geometry.vertices.push([...a], [...b], [...c]);
	geometry.faces.push([base, base + 1, base + 2]);
	geometry.uvs.push(...(uvs || [[0, 0], [1, 0], [0, 1]]));
}

export function addQuad(geometry, a, b, c, d, uvs = null) {
	const texture = uvs || [[0, 0], [1, 0], [1, 1], [0, 1]];
	addTriangle(geometry, a, b, c, [texture[0], texture[1], texture[2]]);
	addTriangle(geometry, a, c, d, [texture[0], texture[2], texture[3]]);
}

export function finalizeWorldGeometry(geometry) {
	geometry.normals = Array.from({ length: geometry.vertices.length }, () => [0, 1, 0]);
	for (const face of geometry.faces) {
		const normal = triangleNormal(...face.map(index => geometry.vertices[index]));
		for (const index of face) geometry.normals[index] = normal;
	}
	geometry.bounds = geometryBounds(geometry.vertices);
	geometry.stats = {
		triangles: geometry.faces.length,
		vertices: geometry.vertices.length
	};
	return geometry;
}

export function geometryBounds(vertices) {
	const minimum = [Infinity, Infinity, Infinity];
	const maximum = [-Infinity, -Infinity, -Infinity];
	for (const point of vertices) {
		for (let axis = 0; axis < 3; axis += 1) {
			minimum[axis] = Math.min(minimum[axis], point[axis]);
			maximum[axis] = Math.max(maximum[axis], point[axis]);
		}
	}
	return vertices.length ? { maximum, minimum } : { maximum: [0, 0, 0], minimum: [0, 0, 0] };
}

function triangleNormal(a, b, c) {
	const ab = b.map((value, axis) => value - a[axis]);
	const ac = c.map((value, axis) => value - a[axis]);
	const cross = [
		ab[1] * ac[2] - ab[2] * ac[1],
		ab[2] * ac[0] - ab[0] * ac[2],
		ab[0] * ac[1] - ab[1] * ac[0]
	];
	const length = Math.hypot(...cross) || 1;
	return cross.map(value => value / length);
}
