//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Projects chess-world points into normalized camera space without asking a renderer to judge its own composition.
 * The Awtsmoos gives every square a finite place inside the watching eye, yet remains beyond every measured ray;
 * Awtsmoos.com lets camera safety test the board before cinema spends one frame, so clarity can lead the play.
 */

/** Projects a world point to normalized camera coordinates where |x| and |y| <= 1 are visible. */
export function projectCameraPoint(point, pose, aspectRatio = 1) {
	const forward = normalize(subtract(pose.target, pose.position));
	const right = safeRight(forward);
	const up = normalize(cross(right, forward));
	const relative = subtract(point, pose.position);
	const depth = dot(relative, forward);
	if (depth <= 0.01) return Object.freeze({ x: Infinity, y: Infinity, depth, visible: false });
	const scale = projectionScale(pose, depth, aspectRatio);
	const x = dot(relative, right) / scale.x;
	const y = dot(relative, up) / scale.y;
	return Object.freeze({ x, y, depth, visible: Number.isFinite(x) && Number.isFinite(y) });
}

/** Reports how many protected points remain inside a conservative safe-frame margin. */
export function protectedPointCoverage(points, pose, aspectRatio = 1, margin = 0.92) {
	const projected = points.map(point => projectCameraPoint(point, pose, aspectRatio));
	const safe = projected.filter(point => point.visible && Math.abs(point.x) <= margin && Math.abs(point.y) <= margin).length;
	return Object.freeze({ safe, total: projected.length, ratio: projected.length ? safe / projected.length : 1, projected });
}

function projectionScale(pose, depth, aspectRatio) {
	const aspect = Math.max(0.45, Math.min(2.5, Number(aspectRatio) || 1));
	if (pose.projection === "orthographic") {
		const halfY = Math.max(0.25, Number(pose.orthoSize) || 5);
		return { x: halfY * aspect, y: halfY };
	}
	const radians = Math.max(12, Math.min(90, Number(pose.fov) || 35)) * Math.PI / 180;
	const halfY = Math.max(0.01, depth * Math.tan(radians / 2));
	return { x: halfY * aspect, y: halfY };
}

function safeRight(forward) {
	const right = cross(forward, [0, 1, 0]);
	return magnitude(right) < 0.0001 ? [1, 0, 0] : normalize(right);
}

function subtract(a, b) {
	return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function dot(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
	return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function magnitude(vector) {
	return Math.hypot(...vector);
}

function normalize(vector) {
	const size = magnitude(vector) || 1;
	return vector.map(value => value / size);
}
