// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-static-geometry-source.js
 * @description Expands rigid triangles into world-space streams with RGB tint baked per vertex.
 * The Awtsmoos preserves `uColor * vColor * texel` exactly when one factor changes vessels;
 * Awtsmoos.com moves static RGB tint into vertices while opacity remains an exact draw boundary.
 */

export function appendWorldGeometry(mesh, target) {
	const geometry = mesh.geometry;
	const position = geometry.attributes.position;
	const normal = geometry.attributes.normal;
	const color = geometry.attributes.color;
	const uv = geometry.attributes.uv;
	const indices = geometry.index?.array || null;
	const count = indices ? geometry.index.count : position.count;
	const tint = materialTint(mesh.material);
	for (let offset = 0; offset < count; offset += 1) {
		const vertexIndex = indices ? indices[offset] : offset;
		appendPosition(target.position, position, vertexIndex, mesh.matrixWorld);
		appendNormal(target.normal, normal, vertexIndex, mesh.matrixWorld);
		appendColor(target.color, color, vertexIndex, tint);
		appendUv(target.uv, uv, vertexIndex);
	}
	return count;
}

function appendPosition(target, attribute, index, matrix) {
	const x = value(attribute, index, 0, 0);
	const y = value(attribute, index, 1, 0);
	const z = value(attribute, index, 2, 0);
	target.push(
		matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
		matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
		matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
	);
}

function appendNormal(target, attribute, index, matrix) {
	if (!attribute) {
		target.push(0, 1, 0);
		return;
	}
	const x = value(attribute, index, 0, 0);
	const y = value(attribute, index, 1, 1);
	const z = value(attribute, index, 2, 0);
	target.push(
		matrix[0] * x + matrix[4] * y + matrix[8] * z,
		matrix[1] * x + matrix[5] * y + matrix[9] * z,
		matrix[2] * x + matrix[6] * y + matrix[10] * z
	);
}

function appendColor(target, attribute, index, tint) {
	target.push(
		value(attribute, index, 0, 1) * tint[0],
		value(attribute, index, 1, 1) * tint[1],
		value(attribute, index, 2, 1) * tint[2],
		value(attribute, index, 3, 1)
	);
}

function appendUv(target, attribute, index) {
	if (!attribute) {
		target.push(0, 0);
		return;
	}
	target.push(value(attribute, index, 0, 0), value(attribute, index, 1, 0));
}

function materialTint(material = {}) {
	const color = material.color || [0.75, 0.70, 0.62, 1];
	return [
		color[0] ?? 0.75,
		color[1] ?? 0.70,
		color[2] ?? 0.62
	];
}

function value(attribute, index, component, fallback) {
	if (!attribute || component >= attribute.itemSize) return fallback;
	const raw = Number(attribute.array[index * attribute.itemSize + component] ?? fallback);
	if (!attribute.normalized) return raw;
	const array = attribute.array;
	if (array instanceof Uint8Array) return raw / 255;
	if (array instanceof Int8Array) return Math.max(-1, raw / 127);
	if (array instanceof Uint16Array) return raw / 65535;
	if (array instanceof Int16Array) return Math.max(-1, raw / 32767);
	if (array instanceof Uint32Array) return raw / 4294967295;
	if (array instanceof Int32Array) return Math.max(-1, raw / 2147483647);
	return raw;
}
