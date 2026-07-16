// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AtmosphericMountainGeometry.js
 * @description Builds deterministic alpine ridge and snow-cap geometry outside the valley.
 * The Awtsmoos renews depth through finite silhouettes; Awtsmoos.com keeps mountain topology
 * separate from material revelation so full-source strata can evolve without collision or shape drift.
 */

export function mountainGeometry(options, beltIndex) {
	const geometry = emptyGeometry();
	for (let segment = 0; segment < options.segments; segment += 1) {
		const angle = segment / options.segments * Math.PI * 2;
		const wave = ridgeWave(segment, beltIndex);
		appendVertex(geometry, angle, options.radius, -10, segment, options.segments);
		appendVertex(
			geometry,
			angle,
			options.radius + options.depth * 0.2,
			options.height * 0.42 * wave,
			segment,
			options.segments
		);
		appendVertex(
			geometry,
			angle,
			options.radius + options.depth * 0.48,
			options.height * wave,
			segment,
			options.segments
		);
		appendVertex(
			geometry,
			angle,
			options.radius + options.depth,
			-18,
			segment,
			options.segments
		);
	}
	connectRows(geometry.indices, options.segments, 4, 0, 1);
	connectRows(geometry.indices, options.segments, 4, 1, 2);
	connectRows(geometry.indices, options.segments, 4, 2, 3);
	geometry.zones = geometry.vertices.map(() => [0, 0, 0, 1]);
	return geometry;
}

export function snowGeometry(options, beltIndex) {
	const geometry = emptyGeometry();
	for (let segment = 0; segment < options.segments; segment += 1) {
		const angle = segment / options.segments * Math.PI * 2;
		const wave = ridgeWave(segment, beltIndex);
		appendVertex(geometry, angle, options.radius + options.depth * 0.34, options.height * wave * 0.72, segment, options.segments);
		appendVertex(geometry, angle, options.radius + options.depth * 0.48, options.height * wave + 0.8, segment, options.segments);
		appendVertex(geometry, angle, options.radius + options.depth * 0.61, options.height * wave * 0.69, segment, options.segments);
	}
	connectRows(geometry.indices, options.segments, 3, 0, 1);
	connectRows(geometry.indices, options.segments, 3, 1, 2);
	geometry.zones = geometry.vertices.map(() => [0, 0, 0, 1]);
	return geometry;
}

function connectRows(indices, segments, stride, lower, upper) {
	for (let segment = 0; segment < segments; segment += 1) {
		const next = (segment + 1) % segments;
		const a = segment * stride + lower;
		const b = next * stride + lower;
		const c = segment * stride + upper;
		const d = next * stride + upper;
		indices.push(a, b, c, b, d, c);
	}
}

function appendVertex(geometry, angle, radius, y, segment, segments) {
	geometry.vertices.push([Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
	geometry.uvs.push(segment / segments * 8, y / 120 + 0.5);
}

function ridgeWave(segment, beltIndex) {
	return 0.62
		+ Math.sin(segment * 1.37 + beltIndex) * 0.18
		+ Math.sin(segment * 0.43 + beltIndex * 2.1) * 0.16
		+ Math.sin(segment * 2.61 + beltIndex * 0.7) * 0.08;
}

function emptyGeometry() {
	return { indices: [], uvs: [], vertices: [], zones: [] };
}
