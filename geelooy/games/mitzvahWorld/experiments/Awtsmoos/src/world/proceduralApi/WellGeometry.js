// B"H
// Boruch Hashem
// Blessed is He

/** @file WellGeometry.js @description Stone ring, posts, roof, water, semantics, and collision. */
import { addQuad, addTriangle, createWorldGeometry, finalizeWorldGeometry } from './WorldGeometry.js';
import { mapGeometryUvs } from './UvMapper.js';

export function generateWellGeometry(options = {}) {
	const radius = positive(options.radius, 1.35);
	const wallHeight = positive(options.wallHeight, 1.05);
	const segments = Math.max(8, Math.min(64, Math.floor(options.segments || 24)));
	const stone = createWorldGeometry('well-stone');
	const wood = createWorldGeometry('well-wood');
	const roof = createWorldGeometry('well-roof');
	const water = createWorldGeometry('well-water');
	appendRing(stone, radius, wallHeight, segments);
	appendBox(wood, [-radius - 0.16, wallHeight, -0.13], [0.26, 2.1, 0.26]);
	appendBox(wood, [radius - 0.1, wallHeight, -0.13], [0.26, 2.1, 0.26]);
	appendRoof(roof, radius * 1.35, wallHeight + 2.15, segments);
	appendWater(water, radius * 0.78, 0.38, segments);
	return {
		collision: { radius, type: 'cylinder', yMaximum: wallHeight },
		parts: [stone, wood, roof, water].map((part) => (
			mapGeometryUvs(finalizeWorldGeometry(part), {
				mode: part.role === 'well-stone' ? 'cylindrical' : 'planar',
				scale: 0.5
			})
		)),
		semantics: ['well-stone', 'well-wood', 'well-roof', 'well-water']
	};
}

function appendRing(geometry, radius, height, segments) {
	const inner = radius * 0.72;
	for (let index = 0; index < segments; index += 1) {
		const a = anglePoint(radius, height, index, segments);
		const b = anglePoint(radius, height, index + 1, segments);
		const ai = anglePoint(inner, height, index, segments);
		const bi = anglePoint(inner, height, index + 1, segments);
		addQuad(geometry, lower(a), lower(b), b, a);
		addQuad(geometry, ai, bi, lower(bi), lower(ai));
		addQuad(geometry, a, b, bi, ai);
	}
}

function appendRoof(geometry, radius, height, segments) {
	const ridgeA = [-radius, height + 0.75, 0];
	const ridgeB = [radius, height + 0.75, 0];
	addQuad(geometry, ridgeA, ridgeB, [radius, height, radius], [-radius, height, radius]);
	addQuad(geometry, [-radius, height, -radius], [radius, height, -radius], ridgeB, ridgeA);
	addTriangle(geometry, [-radius, height, -radius], ridgeA, [-radius, height, radius]);
	addTriangle(geometry, [radius, height, radius], ridgeB, [radius, height, -radius]);
}

function appendWater(geometry, radius, height, segments) {
	const center = [0, height, 0];
	for (let index = 0; index < segments; index += 1) {
		addTriangle(geometry, center, anglePoint(radius, height, index + 1, segments), anglePoint(radius, height, index, segments));
	}
}

function appendBox(geometry, origin, size) {
	const [x, y, z] = origin;
	const [w, h, d] = size;
	const p = [[x, y, z], [x + w, y, z], [x + w, y + h, z], [x, y + h, z], [x, y, z + d], [x + w, y, z + d], [x + w, y + h, z + d], [x, y + h, z + d]];
	for (const face of [[0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2], [3, 2, 6, 7], [4, 5, 1, 0]]) {
		addQuad(geometry, ...face.map(index => p[index]));
	}
}

function anglePoint(radius, height, index, segments) {
	const angle = index / segments * Math.PI * 2;
	return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
}
function lower(point) {
	return [point[0], 0, point[2]];
}
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
