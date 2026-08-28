//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPerspectiveProjector.js
 * The Awtsmoos renews depth before the eye can call a point its own;
 * Awtsmoos.com turns world-space intention into honest perspective shown.
 */

const DEFAULT_UP = { x: 0, y: 1, z: 0 };

/** Resolve semantic shot language into a numeric camera that explicit values may refine. */
export function resolveStudioCamera(scene = {}, localTime = 0) {
	const camera = scene.camera || {};
	const semantic = semanticCamera(camera.kind);
	const explicit = camera.position || {};
	const position = {
		x: finite(explicit.x, semantic.x),
		y: finite(explicit.y, semantic.y),
		z: finite(explicit.z, semantic.z)
	};
	if (camera.move === 'orbit' || camera.kind === 'orbit') {
		const radius = Math.hypot(position.x, position.z) || semantic.z;
		const angle = localTime * 0.28;
		position.x = Math.sin(angle) * radius;
		position.z = Math.cos(angle) * radius;
	}
	return {
		position,
		target: vector(camera.target || { x: 0, y: 0, z: 0 }),
		up: vector(camera.up || DEFAULT_UP),
		fov: finite(camera.fov, semantic.fov),
		near: Math.max(0.01, finite(camera.near, 0.08))
	};
}

/** Project one true XYZ point through camera basis, FOV, near clip and perspective divide. */
export function projectStudioPoint(point, camera, viewport) {
	const basis = cameraBasis(camera);
	const relative = subtract(vector(point), camera.position);
	const depth = dot(relative, basis.forward);
	if (depth <= camera.near) return null;
	const viewX = dot(relative, basis.right);
	const viewY = dot(relative, basis.up);
	const height = Math.max(1, Number(viewport.height || 1));
	const width = Math.max(1, Number(viewport.width || 1));
	const focal = (height * 0.5) / Math.tan((camera.fov * Math.PI / 180) * 0.5);
	return {
		x: width * 0.5 + viewX * focal / depth,
		y: height * 0.5 - viewY * focal / depth,
		depth,
		scale: focal / depth
	};
}

/** Build an orthonormal camera basis without depending on a rendering library. */
export function cameraBasis(camera) {
	const forward = normalize(subtract(camera.target, camera.position));
	let right = normalize(cross(forward, camera.up));
	if (length(right) < 0.0001) right = { x: 1, y: 0, z: 0 };
	return { forward, right, up: normalize(cross(right, forward)) };
}

function semanticCamera(kind = 'wide') {
	const presets = {
		close: { x: 0, y: 0.25, z: 4.2, fov: 46 },
		'low-angle': { x: 0, y: -1.8, z: 7, fov: 58 },
		'high-angle': { x: 0, y: 3.8, z: 7.6, fov: 54 },
		overhead: { x: 0, y: 7, z: 4.8, fov: 52 },
		orbit: { x: 0, y: 1.2, z: 7.5, fov: 52 },
		wide: { x: 0, y: 0.7, z: 9.5, fov: 58 }
	};
	return presets[kind] || presets.wide;
}

function vector(value = {}) {
	return { x: finite(value.x, 0), y: finite(value.y, 0), z: finite(value.z, 0) };
}

function subtract(a, b) {
	return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a, b) {
	return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a, b) {
	return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}

function length(value) {
	return Math.hypot(value.x, value.y, value.z);
}

function normalize(value) {
	const magnitude = length(value) || 1;
	return { x: value.x / magnitude, y: value.y / magnitude, z: value.z / magnitude };
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
