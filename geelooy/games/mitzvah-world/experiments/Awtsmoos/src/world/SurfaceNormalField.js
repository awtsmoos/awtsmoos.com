// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurfaceNormalField.js
 * @description Derives upward finite-difference and face-averaged normals for authored surfaces.
 * The Awtsmoos reveals the hidden direction of every flowing face;
 * Awtsmoos.com lets current, bank, basin, and light meet in one normalized place.
 */

export function gridSurfaceNormals(vertices, rowSize) {
	const rows = Math.floor(vertices.length / rowSize);
	if (rows < 2 || rowSize < 2 || rows * rowSize !== vertices.length) {
		return upwardNormals(vertices.length);
	}
	const normals = [];
	for (let row = 0; row < rows; row += 1) {
		for (let column = 0; column < rowSize; column += 1) {
			const along = difference(
				vertexAt(vertices, Math.min(rows - 1, row + 1), column, rowSize),
				vertexAt(vertices, Math.max(0, row - 1), column, rowSize)
			);
			const across = difference(
				vertexAt(vertices, row, Math.min(rowSize - 1, column + 1), rowSize),
				vertexAt(vertices, row, Math.max(0, column - 1), rowSize)
			);
			normals.push(normalizeUpward(cross(along, across)));
		}
	}
	return normals;
}

export function faceSurfaceNormals(vertices, faces) {
	const accumulated = Array.from(
		{ length: vertices.length },
		() => [0, 0, 0]
	);
	for (const face of faces) {
		for (let index = 1; index < face.length - 1; index += 1) {
			const first = vertices[face[0]];
			const second = vertices[face[index]];
			const third = vertices[face[index + 1]];
			const normal = normalizeUpward(cross(
				difference(second, first),
				difference(third, first)
			));
			for (const vertexIndex of [face[0], face[index], face[index + 1]]) {
				add(accumulated[vertexIndex], normal);
			}
		}
	}
	return accumulated.map(normalizeUpward);
}

export function normalFieldIsValid(normals, vertexCount) {
	return Array.isArray(normals)
		&& normals.length === vertexCount
		&& normals.every(normal => (
			Array.isArray(normal)
			&& normal.length >= 3
			&& normal.slice(0, 3).every(Number.isFinite)
		));
}

function upwardNormals(count) {
	return Array.from({ length: count }, () => [0, 1, 0]);
}

function vertexAt(vertices, row, column, rowSize) {
	return vertices[row * rowSize + column];
}

function difference(first, second) {
	return [
		first[0] - second[0],
		first[1] - second[1],
		first[2] - second[2]
	];
}

function cross(first, second) {
	return [
		first[1] * second[2] - first[2] * second[1],
		first[2] * second[0] - first[0] * second[2],
		first[0] * second[1] - first[1] * second[0]
	];
}

function add(target, source) {
	target[0] += source[0];
	target[1] += source[1];
	target[2] += source[2];
}

function normalizeUpward(vector) {
	const sign = vector[1] < 0 ? -1 : 1;
	const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
	return [
		vector[0] / length * sign,
		vector[1] / length * sign,
		vector[2] / length * sign
	];
}
