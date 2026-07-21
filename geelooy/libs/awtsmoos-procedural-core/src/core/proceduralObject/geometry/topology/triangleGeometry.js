// B"H

/** Ensures a geometry can enter deterministic indexed-triangle analysis. */
export function assertIndexedTriangleGeometry(geometry) {
	if (!geometry || typeof geometry !== "object") {
		throw new TypeError("Geometry must be an object.");
	}
	if (geometry.topology !== "triangles") {
		throw new TypeError("Topology analysis requires triangle geometry.");
	}
	const position = geometry.attributes?.position;
	if (!position || position.itemSize < 3) {
		throw new TypeError("Triangle geometry requires XYZ position attributes.");
	}
	if (!geometry.indices || geometry.indices.array.length % 3 !== 0) {
		throw new TypeError("Topology analysis requires indexed triangle triplets.");
	}
	return geometry;
}

/** Reads one XYZ point from a normalized position attribute. */
export function readGeometryPoint(position, vertexIndex) {
	const offset = vertexIndex * position.itemSize;
	return [
		position.array[offset],
		position.array[offset + 1],
		position.array[offset + 2]
	];
}

/** Returns squared magnitude of the triangle cross product. */
export function triangleCrossLengthSquared(position, aIndex, bIndex, cIndex) {
	const a = readGeometryPoint(position, aIndex);
	const b = readGeometryPoint(position, bIndex);
	const c = readGeometryPoint(position, cIndex);
	const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
	const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
	const cross = [
		ab[1] * ac[2] - ab[2] * ac[1],
		ab[2] * ac[0] - ab[0] * ac[2],
		ab[0] * ac[1] - ab[1] * ac[0]
	];
	return cross[0] ** 2 + cross[1] ** 2 + cross[2] ** 2;
}

/** Gives an orientation-independent edge key. */
export function canonicalEdgeKey(left, right) {
	return left < right ? `${left}:${right}` : `${right}:${left}`;
}

/** Gives an orientation-independent face key. */
export function canonicalFaceKey(a, b, c) {
	return [a, b, c].sort((left, right) => left - right).join(":");
}

/** Iterates face triplets in stable face-index order. */
export function forEachTriangle(geometry, visitor) {
	assertIndexedTriangleGeometry(geometry);
	const indices = geometry.indices.array;
	for (let offset = 0; offset < indices.length; offset += 3) {
		visitor(indices[offset], indices[offset + 1], indices[offset + 2], offset / 3);
	}
}
