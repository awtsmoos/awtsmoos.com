// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TinyGeometryPacking.js
 * @description Packs inspectable world geometry into deterministic typed arrays.
 * Every loose point is gathered into one renderable vessel while the Awtsmoos
 * remains beyond point, face, normal, color, and the unity they reveal.
 */

export function packTinyGeometry(geometry) {
	const vertices = requireVertices(geometry?.vertices);
	const faces = requireFaces(geometry?.faces, vertices.length);
	const normals = validVectors(geometry?.normals, vertices.length, 3)
		? geometry.normals
		: smoothNormals(vertices, faces);
	const uvs = validVectors(geometry?.uvs, vertices.length, 2)
		? geometry.uvs
		: vertices.map(point => [point[0] * 0.1, point[2] * 0.1]);
	const colors = validVectors(geometry?.colors, vertices.length, 4)
		? geometry.colors
		: vertices.map(() => [1, 1, 1, 1]);
	const indices = faces.flat();
	const IndexArray = vertices.length > 65535 ? Uint32Array : Uint16Array;
	return {
		colors: new Float32Array(colors.flat()),
		indices: new IndexArray(indices),
		normals: new Float32Array(normals.flat()),
		positions: new Float32Array(vertices.flat()),
		uvs: new Float32Array(uvs.flat())
	};
}

function requireVertices(vertices) {
	if (!Array.isArray(vertices) || vertices.length === 0) {
		throw new TypeError('World geometry requires at least one vertex.');
	}
	if (!vertices.every(point => Array.isArray(point) && point.length === 3 && point.every(Number.isFinite))) {
		throw new TypeError('World geometry vertices must contain finite xyz values.');
	}
	return vertices;
}

function requireFaces(faces, vertexCount) {
	if (!Array.isArray(faces) || faces.length === 0) {
		throw new TypeError('World geometry requires at least one triangle.');
	}
	if (!faces.every(face => (
		Array.isArray(face)
		&& face.length === 3
		&& face.every(index => Number.isInteger(index) && index >= 0 && index < vertexCount)
	))) {
		throw new TypeError('World geometry faces must reference valid triangle vertices.');
	}
	return faces;
}

function validVectors(vectors, count, width) {
	return Array.isArray(vectors)
		&& vectors.length === count
		&& vectors.every(vector => Array.isArray(vector) && vector.length === width && vector.every(Number.isFinite));
}

function smoothNormals(vertices, faces) {
	const normals = vertices.map(() => [0, 0, 0]);
	for (const [a, b, c] of faces) {
		const normal = faceNormal(vertices[a], vertices[b], vertices[c]);
		for (const index of [a, b, c]) {
			for (let axis = 0; axis < 3; axis += 1) normals[index][axis] += normal[axis];
		}
	}
	return normals.map(normalize);
}

function faceNormal(a, b, c) {
	const ab = b.map((value, axis) => value - a[axis]);
	const ac = c.map((value, axis) => value - a[axis]);
	return normalize([
		ab[1] * ac[2] - ab[2] * ac[1],
		ab[2] * ac[0] - ab[0] * ac[2],
		ab[0] * ac[1] - ab[1] * ac[0]
	]);
}

function normalize(vector) {
	const length = Math.hypot(...vector) || 1;
	return vector.map(value => value / length);
}
