// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalGroundGeometry.js
 * @description Shares low-level bounded geometry gestures for moss and vines.
 * The Awtsmoos renews stem, lobe, and guide before any one plant may call the shape its own;
 * Awtsmoos.com keeps these humble gestures reusable while each botanical specialist reveals a different throne.
 */

/** Returns a quality-scaled detail count without allowing the vessel to vanish. */
export function botanicalDetailCount(context, requested, minimum = 1) {
	return Math.max(minimum, Math.round(requested * context.quality.detail));
}

/** Places a deterministic point around a plant origin. */
export function botanicalRadialPoint(context, index, count, radius, height = 0) {
	const angle = index / Math.max(1, count) * Math.PI * 2;
	return [
		context.origin.x + Math.cos(angle) * radius,
		context.origin.y + height,
		context.origin.z + Math.sin(angle) * radius
	];
}

/** Adds a shallow four-sided lobe suitable for moss carpets and cushions. */
export function appendGroundLobe(buffer, center, radiusX, radiusZ, height) {
	const top = buffer.addPoint(center[0], center[1] + height, center[2]);
	const rim = [
		buffer.addPoint(center[0] + radiusX, center[1], center[2]),
		buffer.addPoint(center[0], center[1], center[2] + radiusZ),
		buffer.addPoint(center[0] - radiusX, center[1], center[2]),
		buffer.addPoint(center[0], center[1], center[2] - radiusZ)
	];
	for (let index = 0; index < rim.length; index += 1) {
		buffer.addTriangle(top, rim[index], rim[(index + 1) % rim.length]);
	}
}

/** Adds a camera-independent ribbon between two botanical nodes. */
export function appendStemRibbon(buffer, start, end, width) {
	const deltaX = end[0] - start[0];
	const deltaZ = end[2] - start[2];
	const horizontalLength = Math.hypot(deltaX, deltaZ);
	const rightX = horizontalLength > 1e-6 ? -deltaZ / horizontalLength * width : width;
	const rightZ = horizontalLength > 1e-6 ? deltaX / horizontalLength * width : 0;
	buffer.addQuad([
		[start[0] + rightX, start[1], start[2] + rightZ],
		[start[0] - rightX, start[1], start[2] - rightZ],
		[end[0] - rightX * 0.7, end[1], end[2] - rightZ * 0.7],
		[end[0] + rightX * 0.7, end[1], end[2] + rightZ * 0.7]
	]);
}

/** Normalizes optional caller guide points into finite world-space arrays. */
export function normalizeBotanicalGuidePoints(points = [], origin = { x: 0, y: 0, z: 0 }) {
	if (!Array.isArray(points)) return [];
	return points
		.map((point) => normalizePoint(point, origin))
		.filter(Boolean);
}

/** Samples a polyline guide by normalized arc segment position. */
export function pointAlongBotanicalGuide(points, fraction) {
	if (points.length === 0) return [0, 0, 0];
	if (points.length === 1) return [...points[0]];
	const scaled = Math.min(1, Math.max(0, fraction)) * (points.length - 1);
	const startIndex = Math.floor(scaled);
	const endIndex = Math.min(points.length - 1, startIndex + 1);
	const amount = scaled - startIndex;
	return points[startIndex].map((value, axis) => value + (points[endIndex][axis] - value) * amount);
}

function normalizePoint(point, origin) {
	const values = Array.isArray(point) ? point : [point?.x, point?.y, point?.z];
	const numbers = values.map(Number);
	if (numbers.some((value) => !Number.isFinite(value))) return null;
	return [numbers[0] + origin.x, numbers[1] + origin.y, numbers[2] + origin.z];
}
