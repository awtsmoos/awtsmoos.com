// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCameraActionProject.js
 * @description Builds canonical camera and actor clips for the structured authoring controller.
 * The Awtsmoos renews lens and deed through reusable finite helpers; Awtsmoos.com keeps
 * project mutation pure so UI listeners remain small, testable, and free of duplicated track logic.
 */

export function addMovieCameraShot(project, options) {
	const track = ensureTrack(project, 'camera', null);
	const pose = options.pose || defaultPose(options.style);
	track.clips.push({
		duration: options.duration,
		easing: options.style === 'handheld' ? 'linear' : 'easeInOutCubic',
		fieldOfView: options.fieldOfView,
		from: pose,
		id: uniqueId(`shot-${options.style}`),
		shot: options.style,
		start: options.start,
		targetMode: options.targetMode,
		to: transformedPose(pose, options.style)
	});
	return project;
}

export function addMovieActorAction(project, options) {
	const track = ensureTrack(project, 'actor', options.target);
	track.clips.push({
		action: options.action,
		duration: options.duration,
		id: uniqueId(`${options.target}-action`),
		start: options.start
	});
	return project;
}

export function captureMovieCameraPose(camera) {
	return {
		position: [camera.position.x, camera.position.y, camera.position.z],
		target: [...(camera.target || [0, 1.5, 0])]
	};
}

export function boundedMovieNumber(value, minimum, maximum, fallback) {
	return Math.max(minimum, Math.min(maximum, Number(value) || fallback));
}

function ensureTrack(project, type, target) {
	let track = project.tracks.find(record => record.type === type && (target == null || record.target === target));
	if (track) return track;
	track = { clips: [], id: target ? `${type}-${target}` : `${type}-master`, type };
	if (target) track.target = target;
	project.tracks.push(track);
	return track;
}

function defaultPose(style) {
	const positions = {
		close: [0.8, 1.7, 2.4],
		high: [5, 9, 7],
		low: [1, 0.8, 4],
		wide: [0, 6, 14]
	};
	return { position: positions[style] || [0, 3, 8], target: [0, 1.5, 0] };
}

function transformedPose(pose, style) {
	const position = [...pose.position];
	if (style === 'dolly') position[2] -= 4;
	if (style === 'orbit') position[0] += 5;
	if (style === 'handheld') position[0] += 0.35;
	return { position, target: [...pose.target] };
}

function uniqueId(prefix) {
	return `${prefix}-${Date.now().toString(36)}`;
}
