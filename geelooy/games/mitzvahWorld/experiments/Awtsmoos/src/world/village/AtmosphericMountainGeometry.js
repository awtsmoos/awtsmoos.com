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
			options.radius + options.depth * 0.16,
			options.height * 0.34 * shoulderWave(segment, beltIndex),
			segment,
			options.segments
		);
		appendVertex(
			geometry,
			angle,
			options.radius + options.depth * 0.52,
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
		appendVertex(geometry, angle, options.radius + options.depth * 0.39, options.height * wave * 0.84, segment, options.segments);
		appendVertex(geometry, angle, options.radius + options.depth * 0.48, options.height * wave + 0.8, segment, options.segments);
		appendVertex(geometry, angle, options.radius + options.depth * 0.57, options.height * wave * 0.83, segment, options.segments);
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
	const broad = Math.sin(segment * 0.17 + beltIndex * 1.9) * 0.16;
	const ridge = Math.abs(Math.sin(segment * 0.43 + beltIndex * 0.71)) ** 1.7 * 0.23;
	const broken = Math.sin(segment * 1.31 + beltIndex * 2.3) * 0.075;
	return 0.48 + broad + ridge + broken;
}

function shoulderWave(segment, beltIndex) {
	return 0.56
		+ Math.sin(segment * 0.21 + beltIndex) * 0.12
		+ Math.sin(segment * 0.67 + beltIndex * 0.4) * 0.07;
}

function emptyGeometry() {
	return { indices: [], uvs: [], vertices: [], zones: [] };
}
