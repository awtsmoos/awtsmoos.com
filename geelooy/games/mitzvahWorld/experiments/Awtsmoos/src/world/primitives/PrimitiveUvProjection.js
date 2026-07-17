// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveUvProjection.js
 * @description Projects missing UVs, measures their world scale, and bakes one world-unit basis.
 * The Awtsmoos joins image coordinates to physical place without stretching either vessel;
 * Awtsmoos.com bakes geometric scale into UVs so identical materials can batch as one revelation.
 */

export function projectPrimitiveUvs(vertices, normals, definition) {
	const tile = positive(definition.texturePolicy?.tileWorld, 4);
	return vertices.flatMap((point, index) => {
		const offset = index * 3;
		const ax = Math.abs(normals[offset]);
		const ay = Math.abs(normals[offset + 1]);
		const az = Math.abs(normals[offset + 2]);
		if (ay >= ax && ay >= az) return [point.x / tile, point.z / tile];
		if (ax >= az) return [point.z / tile, point.y / tile];
		return [point.x / tile, point.y / tile];
	});
}

export function normalizePrimitiveUvsToWorld(uvs, uvUnitsPerWorld) {
	if (!uvUnitsPerWorld) return [...uvs];
	const [uUnits, vUnits] = uvUnitsPerWorld;
	return uvs.map((value, index) => (
		index % 2 === 0 ? value / uUnits : value / vUnits
	));
}

export function measureUvUnitsPerWorld(data) {
	const uWorld = [];
	const vWorld = [];
	for (let offset = 0; offset < data.indices.length; offset += 3) {
		const sample = triangleUvWorldScale(data, offset);
		if (!sample) continue;
		uWorld.push(sample.uWorld);
		vWorld.push(sample.vWorld);
	}
	if (!uWorld.length || !vWorld.length) return null;
	return [1 / robustMedian(uWorld), 1 / robustMedian(vWorld)];
}

function triangleUvWorldScale(data, offset) {
	const indices = data.indices.slice(offset, offset + 3);
	const [p0, p1, p2] = indices.map(index => data.vertices[index]);
	const [uv0, uv1, uv2] = indices.map(index => uvAt(data.uvs, index));
	const du1 = uv1[0] - uv0[0];
	const dv1 = uv1[1] - uv0[1];
	const du2 = uv2[0] - uv0[0];
	const dv2 = uv2[1] - uv0[1];
	const determinant = du1 * dv2 - du2 * dv1;
	if (Math.abs(determinant) < 1e-10) return null;
	const first = subtract(p1, p0);
	const second = subtract(p2, p0);
	const dPdu = combine(first, dv2, second, -dv1, determinant);
	const dPdv = combine(first, -du2, second, du1, determinant);
	const uWorld = length(dPdu);
	const vWorld = length(dPdv);
	return uWorld > 1e-8 && vWorld > 1e-8 ? { uWorld, vWorld } : null;
}

function robustMedian(values) {
	const logs = values
		.filter(value => Number.isFinite(value) && value > 1e-8)
		.map(Math.log)
		.sort((left, right) => left - right);
	if (!logs.length) return 1;
	const middle = Math.floor(logs.length / 2);
	const value = logs.length % 2
		? logs[middle]
		: (logs[middle - 1] + logs[middle]) / 2;
	return Math.exp(value);
}

function uvAt(uvs, index) {
	return [uvs[index * 2], uvs[index * 2 + 1]];
}

function subtract(left, right) {
	return { x: left.x - right.x, y: left.y - right.y, z: left.z - right.z };
}

function combine(first, firstScale, second, secondScale, divisor) {
	return {
		x: (first.x * firstScale + second.x * secondScale) / divisor,
		y: (first.y * firstScale + second.y * secondScale) / divisor,
		z: (first.z * firstScale + second.z * secondScale) / divisor
	};
}

function length(vector) {
	return Math.hypot(vector.x, vector.y, vector.z);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
