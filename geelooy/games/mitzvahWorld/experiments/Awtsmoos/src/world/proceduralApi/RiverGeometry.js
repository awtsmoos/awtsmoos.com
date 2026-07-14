// B"H
// Boruch Hashem
// Blessed is He

/** @file RiverGeometry.js @description Builds a flowing ribbon, banks, UVs, and collision from a river path. */
import { addQuad, createWorldGeometry, finalizeWorldGeometry } from './WorldGeometry.js';
import { mapGeometryUvs } from './UvMapper.js';

export function generateRiverGeometry(options = {}) {
	const points = normalizePoints(options.points || [[-8, 0, 0], [0, -0.2, 2], [8, -0.35, -1]]);
	const width = positive(options.width, 3.2);
	const bankWidth = positive(options.bankWidth, 1.4);
	const depth = positive(options.depth, 0.7);
	const water = createWorldGeometry('river-water');
	const banks = createWorldGeometry('river-banks');
	for (let index = 0; index < points.length - 1; index += 1) {
		const start = section(points, index, width, bankWidth);
		const end = section(points, index + 1, width, bankWidth);
		addQuad(water, start.left, start.right, end.right, end.left);
		addQuad(banks, start.outerLeft, start.left, end.left, end.outerLeft);
		addQuad(banks, start.right, start.outerRight, end.outerRight, end.right);
		addQuad(banks, lower(start.left, depth), lower(end.left, depth), lower(end.right, depth), lower(start.right, depth));
	}
	return {
		flow: { direction: pathDirection(points), speed: positive(options.flowSpeed, 1.1) },
		parts: [
			mapGeometryUvs(finalizeWorldGeometry(water), { mode: 'planar', scale: 0.12 }),
			mapGeometryUvs(finalizeWorldGeometry(banks), { mode: 'planar', scale: 0.18 })
		]
	};
}

function section(points, index, width, bankWidth) {
	const point = points[index];
	const previous = points[Math.max(0, index - 1)];
	const next = points[Math.min(points.length - 1, index + 1)];
	const dx = next[0] - previous[0];
	const dz = next[2] - previous[2];
	const length = Math.hypot(dx, dz) || 1;
	const perpendicular = [-dz / length, 0, dx / length];
	return {
		left: offset(point, perpendicular, width / 2),
		outerLeft: offset(point, perpendicular, width / 2 + bankWidth),
		outerRight: offset(point, perpendicular, -width / 2 - bankWidth),
		right: offset(point, perpendicular, -width / 2)
	};
}

function normalizePoints(points) {
	if (!Array.isArray(points) || points.length < 2) throw new Error('River requires at least two path points.');
	return points.map(point => point.map(Number));
}
function offset(point, direction, amount) {
	return point.map((value, axis) => value + direction[axis] * amount);
}
function lower(point, depth) {
	return [point[0], point[1] - depth, point[2]];
}
function pathDirection(points) {
	const first = points[0];
	const last = points.at(-1);
	const length = Math.hypot(last[0] - first[0], last[2] - first[2]) || 1;
	return [(last[0] - first[0]) / length, (last[2] - first[2]) / length];
}
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
