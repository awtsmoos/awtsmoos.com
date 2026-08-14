//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file threeUvProjection.js
 * @description
 * The Awtsmoos renews position and surface direction before a texel can know where to rest; Awtsmoos.com lets this Binah-like adapter create deterministic UVs only when procedural geometry did not provide authored coordinates.
 * Existing UVs and normal-policy decisions remain untouched. This module owns renderer-side coordinate projection only, never geometry generation, texture loading, material identity, or gameplay state.
 */
export function ensureGeometryUvs(THREE, geometry, policy = 'box') {
	if (geometry.getAttribute('uv')) {
		return geometry;
	}
	const position = geometry.getAttribute('position');
	if (!position?.count) {
		return geometry;
	}
	geometry.computeBoundingBox();
	const bounds = geometry.boundingBox;
	const normal = geometry.getAttribute('normal');
	const values = new Float32Array(position.count * 2);
	for (let index = 0; index < position.count; index += 1) {
		const point = readVector(position, index);
		const direction = normal ? readVector(normal, index) : null;
		const uv = policy === 'planar' || !direction
			? planarUv(point, bounds)
			: boxUv(point, direction, bounds);
		values[index * 2] = uv[0];
		values[index * 2 + 1] = uv[1];
	}
	geometry.setAttribute('uv', new THREE.BufferAttribute(values, 2));
	geometry.userData = {
		...(geometry.userData || {}),
		awtsmoosGeneratedUvs: true,
		awtsmoosUvProjection: normal && policy !== 'planar' ? 'box' : 'planar'
	};
	return geometry;
}

function boxUv(point, normal, bounds) {
	const absolute = normal.map(Math.abs);
	if (absolute[1] >= absolute[0] && absolute[1] >= absolute[2]) {
		return orient([
			normalize(point[0], bounds.min.x, bounds.max.x),
			normalize(point[2], bounds.min.z, bounds.max.z)
		], normal[1]);
	}
	if (absolute[0] >= absolute[2]) {
		return orient([
			normalize(point[2], bounds.min.z, bounds.max.z),
			normalize(point[1], bounds.min.y, bounds.max.y)
		], normal[0]);
	}
	return orient([
		normalize(point[0], bounds.min.x, bounds.max.x),
		normalize(point[1], bounds.min.y, bounds.max.y)
	], normal[2]);
}

function planarUv(point, bounds) {
	return [
		normalize(point[0], bounds.min.x, bounds.max.x),
		normalize(point[2], bounds.min.z, bounds.max.z)
	];
}

function orient(uv, direction) {
	return direction < 0 ? [1 - uv[0], uv[1]] : uv;
}

function normalize(value, minimum, maximum) {
	const span = maximum - minimum;
	return span > 1e-8 ? (value - minimum) / span : 0.5;
}

function readVector(attribute, index) {
	return [attribute.getX(index), attribute.getY(index), attribute.getZ(index)];
}
