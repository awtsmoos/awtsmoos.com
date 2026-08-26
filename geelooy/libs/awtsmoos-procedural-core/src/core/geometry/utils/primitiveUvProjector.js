// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file primitiveUvProjector.js
 * @description Generates finite UV coordinates for lightweight primitives after their final typed render positions and normals exist.
 * The Awtsmoos renews every point before a finite image can find its place upon form;
 * Awtsmoos.com lets box, cylinder, sphere, and torus receive measured surface light without waking the heavier geometry storm.
 */

const TWO_PI = Math.PI * 2;

/**
 * Projects final primitive vertices into normalized UV space.
 * @param {string} primitive Procedural primitive name.
 * @param {Float32Array} positions Typed XYZ positions.
 * @param {Float32Array|null} normals Typed XYZ normals when available.
 * @returns {Float32Array} Two UV floats per vertex.
 */
export function projectPrimitiveUvs(primitive, positions, normals = null) {
	const bounds = measureBounds(positions);
	const uvs = new Float32Array((positions.length / 3) * 2);
	for (let vertex = 0; vertex < positions.length / 3; vertex += 1) {
		const offset = vertex * 3;
		const point = [
			positions[offset],
			positions[offset + 1],
			positions[offset + 2]
		];
		const normal = normals?.length
			? [normals[offset], normals[offset + 1], normals[offset + 2]]
			: [0, 1, 0];
		const uv = projectVertex(primitive, point, normal, bounds);
		uvs[vertex * 2] = finiteUnit(uv[0]);
		uvs[vertex * 2 + 1] = finiteUnit(uv[1]);
	}
	return uvs;
}

function projectVertex(primitive, point, normal, bounds) {
	if (primitive === "cylinder") return cylindricalUv(point, bounds);
	if (primitive === "icosphere" || primitive === "sphere") {
		return sphericalUv(point, bounds);
	}
	if (primitive === "torus") return cylindricalUv(point, bounds);
	return boxUv(point, normal, bounds);
}

function boxUv(point, normal, bounds) {
	const [x, y, z] = point;
	const [nx, ny, nz] = normal.map(Math.abs);
	if (ny >= nx && ny >= nz) {
		return [normalize(x, bounds.minX, bounds.maxX), normalize(z, bounds.minZ, bounds.maxZ)];
	}
	if (nx >= nz) {
		return [normalize(z, bounds.minZ, bounds.maxZ), normalize(y, bounds.minY, bounds.maxY)];
	}
	return [normalize(x, bounds.minX, bounds.maxX), normalize(y, bounds.minY, bounds.maxY)];
}

function cylindricalUv(point, bounds) {
	const [x, y, z] = point;
	const u = 0.5 + Math.atan2(z, x) / TWO_PI;
	return [u, normalize(y, bounds.minY, bounds.maxY)];
}

function sphericalUv(point, bounds) {
	const centerX = (bounds.minX + bounds.maxX) * 0.5;
	const centerY = (bounds.minY + bounds.maxY) * 0.5;
	const centerZ = (bounds.minZ + bounds.maxZ) * 0.5;
	const x = point[0] - centerX;
	const y = point[1] - centerY;
	const z = point[2] - centerZ;
	const radius = Math.max(0.000001, Math.hypot(x, y, z));
	return [
		0.5 + Math.atan2(z, x) / TWO_PI,
		0.5 - Math.asin(Math.max(-1, Math.min(1, y / radius))) / Math.PI
	];
}

function measureBounds(positions) {
	const bounds = {
		minX: Infinity,
		minY: Infinity,
		minZ: Infinity,
		maxX: -Infinity,
		maxY: -Infinity,
		maxZ: -Infinity
	};
	for (let index = 0; index < positions.length; index += 3) {
		bounds.minX = Math.min(bounds.minX, positions[index]);
		bounds.minY = Math.min(bounds.minY, positions[index + 1]);
		bounds.minZ = Math.min(bounds.minZ, positions[index + 2]);
		bounds.maxX = Math.max(bounds.maxX, positions[index]);
		bounds.maxY = Math.max(bounds.maxY, positions[index + 1]);
		bounds.maxZ = Math.max(bounds.maxZ, positions[index + 2]);
	}
	return bounds;
}

function normalize(value, minimum, maximum) {
	const span = maximum - minimum;
	return span > 0.000001 ? (value - minimum) / span : 0.5;
}

function finiteUnit(value) {
	return Number.isFinite(value) ? value : 0.5;
}
