//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Applies shared Chess camera poses to the procedural-core native perspective camera.
 * The Awtsmoos gives the eye a place, a target, and a measured field of sight;
 * Awtsmoos.com translates every director pose into native camera law and light.
 */
export function createNativeCamera(runtime, width = 1, height = 1) {
	const camera = new runtime.PerspectiveCamera(34, safeAspect(width, height), 0.08, 120);
	camera.target = [0, 0.5, 0];
	return camera;
}

export function applyNativeCameraPose(camera, pose, width, height) {
	camera.position.set(...pose.position);
	camera.target = [...pose.target];
	camera.aspect = safeAspect(width, height);
	camera.near = pose.near || 0.08;
	camera.far = pose.far || 120;
	camera.fov = resolvedFov(pose);
	camera.userData.projection = pose.projection || "perspective";
	return camera;
}

export function manualNativePose(manual = {}) {
	const distance = Number(manual.distance || 10);
	const elevation = Number(manual.elevation || 6);
	const radians = Number(manual.azimuth || 35) * Math.PI / 180;
	return {
		id: "manual",
		name: "Manual",
		projection: "perspective",
		position: [Math.sin(radians) * distance, elevation, Math.cos(radians) * distance],
		target: [0, 0.45, 0],
		fov: Number(manual.fov || 34),
		duration: 0.35,
		easing: "smooth"
	};
}

function resolvedFov(pose) {
	if (pose.projection !== "orthographic") return Number(pose.fov || 34);
	const distance = Math.hypot(
		pose.position[0] - pose.target[0],
		pose.position[1] - pose.target[1],
		pose.position[2] - pose.target[2]
	);
	const size = Number(pose.orthoSize || 5.2);
	const degrees = 2 * Math.atan(size / Math.max(0.1, distance)) * 180 / Math.PI;
	return Math.max(12, Math.min(58, degrees));
}

function safeAspect(width, height) {
	return Math.max(0.1, Number(width || 1) / Math.max(1, Number(height || 1)));
}
