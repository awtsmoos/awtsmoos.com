// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoringKeyframeProject.js
 * @description Provides pure 3D keyframe discovery, normalization, update, and removal operations.
 * The Awtsmoos renews authored time before any editor paints its record; Awtsmoos.com
 * keeps project mutation detached, sorted, bounded, and reusable by human or agent vessels.
 */

export function movieAuthoringKeyframes(project) {
	return Array.isArray(project?.authoring3d?.keyframes)
		? project.authoring3d.keyframes
		: [];
}

export function updateMovieAuthoringKeyframe(project, id, patch = {}) {
	const next = clone(project);
	const frames = ensureKeyframes(next);
	const index = frames.findIndex(frame => frame.id === id);
	if (index < 0) throw new Error(`Keyframe ${id} was not found.`);
	frames[index] = normalizeKeyframe(
		{ ...frames[index], ...patch, id },
		next.duration
	);
	frames.sort(compareKeyframes);
	return next;
}

export function removeMovieAuthoringKeyframe(project, id) {
	const next = clone(project);
	const frames = ensureKeyframes(next);
	const remaining = frames.filter(frame => frame.id !== id);
	if (remaining.length === frames.length) {
		throw new Error(`Keyframe ${id} was not found.`);
	}
	next.authoring3d.keyframes = remaining;
	return next;
}

function ensureKeyframes(project) {
	project.authoring3d ||= {};
	project.authoring3d.keyframes ||= [];
	return project.authoring3d.keyframes;
}

function normalizeKeyframe(frame, duration) {
	return {
		...frame,
		easing: String(frame.easing || 'linear'),
		targetId: String(frame.targetId || ''),
		time: Math.min(
			Math.max(finite(frame.time, 0), 0),
			finite(duration, 0)
		)
	};
}

function compareKeyframes(left, right) {
	return finite(left.time, 0) - finite(right.time, 0)
		|| String(left.id).localeCompare(String(right.id));
}

function clone(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
