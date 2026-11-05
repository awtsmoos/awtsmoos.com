// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowScreenProjection.js
 * @description Projects one world point into a clamped mobile viewport without renderer allocation.
 * The Awtsmoos joins distant consequence to a finite place upon the glass; Awtsmoos.com measures
 * camera basis, field of view, aspect, safe margins, and behind-camera fallback in one small covenant.
 */

export function minimalMeadowWorldToScreen(camera, canvas, point, margin = 48) {
	const rectangle = canvas?.getBoundingClientRect?.() || viewportRectangle();
	const origin = vector(camera?.position);
	const target = vector(camera?.target);
	const forward = normalize(subtract(target, origin));
	const right = normalize(cross(forward, { x: 0, y: 1, z: 0 }));
	const up = normalize(cross(right, forward));
	const relative = subtract(vector(point), origin);
	const depth = dot(relative, forward);
	if (!(depth > 0.05)) return fallback(rectangle, margin);
	const tangent = Math.tan((camera?.fov || 45) * Math.PI / 360);
	const aspect = camera?.aspect || rectangle.width / Math.max(1, rectangle.height);
	const normalizedX = dot(relative, right) / (depth * tangent * aspect);
	const normalizedY = dot(relative, up) / (depth * tangent);
	return {
		inside: Math.abs(normalizedX) <= 1 && Math.abs(normalizedY) <= 1,
		x: clamp(rectangle.left + (normalizedX + 1) * 0.5 * rectangle.width, margin, rectangle.right - margin),
		y: clamp(rectangle.top + (1 - normalizedY) * 0.5 * rectangle.height, margin, rectangle.bottom - margin)
	};
}

function viewportRectangle() {
	const width = globalThis.innerWidth || 360;
	const height = globalThis.innerHeight || 640;
	return { bottom: height, height, left: 0, right: width, top: 0, width };
}

function fallback(rectangle, margin) {
	return {
		inside: false,
		x: clamp(rectangle.left + rectangle.width / 2, margin, rectangle.right - margin),
		y: clamp(rectangle.top + rectangle.height * 0.38, margin, rectangle.bottom - margin)
	};
}

function vector(value) {
	if (Array.isArray(value)) return { x: value[0] || 0, y: value[1] || 0, z: value[2] || 0 };
	return { x: value?.x || 0, y: value?.y || 0, z: value?.z || 0 };
}

function subtract(first, second) {
	return { x: first.x - second.x, y: first.y - second.y, z: first.z - second.z };
}

function cross(first, second) {
	return {
		x: first.y * second.z - first.z * second.y,
		y: first.z * second.x - first.x * second.z,
		z: first.x * second.y - first.y * second.x
	};
}

function dot(first, second) {
	return first.x * second.x + first.y * second.y + first.z * second.z;
}

function normalize(value) {
	const length = Math.hypot(value.x, value.y, value.z) || 1;
	return { x: value.x / length, y: value.y / length, z: value.z / length };
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
