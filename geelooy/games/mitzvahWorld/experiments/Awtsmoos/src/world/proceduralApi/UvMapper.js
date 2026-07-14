// B"H
// Boruch Hashem
// Blessed is He

/** @file UvMapper.js @description Deterministic planar, cylindrical, and spherical UV projection. */
export function mapGeometryUvs(geometry, mapping = {}) {
	const mode = mapping.mode || 'planar';
	const scale = finite(mapping.scale, 1);
	const uvs = geometry.vertices.map((point) => project(point, mode, scale));
	return { ...geometry, uvs, uvMapping: { mode, scale } };
}

function project(point, mode, scale) {
	if (mode === 'cylindrical') {
		return [0.5 + Math.atan2(point[2], point[0]) / (Math.PI * 2), point[1] * scale];
	}
	if (mode === 'spherical') {
		const radius = Math.hypot(...point) || 1;
		return [
			0.5 + Math.atan2(point[2], point[0]) / (Math.PI * 2),
			0.5 - Math.asin(point[1] / radius) / Math.PI
		];
	}
	if (mode === 'vertical') return [point[0] * scale, point[1] * scale];
	return [point[0] * scale, point[2] * scale];
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number !== 0 ? number : fallback;
}
