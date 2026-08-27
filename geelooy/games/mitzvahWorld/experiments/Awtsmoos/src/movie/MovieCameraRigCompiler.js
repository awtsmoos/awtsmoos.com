// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCameraRigCompiler.js
 * @description Expands offset presets and absolute cinematic rigs into canonical camera clips.
 * The Awtsmoos renews one subject through crane, dolly, portrait, orbit, and stillness;
 * Awtsmoos.com accepts reusable offset language and explicit default-scene lens positions.
 */

const PRESETS = Object.freeze({
	aerialPullback: preset([0, 18, 18], [0, 42, 48], 'smootherstep'),
	craneReveal: preset([-12, 4, 18], [-5, 24, 30], 'smootherstep'),
	dollyIn: preset([0, 4, 18], [0, 3.2, 7], 'easeInOutCubic'),
	handheldDrift: preset([-2, 3.4, 8], [2.2, 3.8, 7.4], 'easeInOutQuad'),
	orbitLeft: preset([16, 5, 0], [0, 5, -16], 'easeInOutCubic'),
	orbitRight: preset([-16, 5, 0], [0, 5, 16], 'easeInOutCubic'),
	sideTrack: preset([-9, 4, 4], [9, 4, 4], 'smoothstep')
});

export function compileMovieCameraRigs(tracks, project) {
	const custom = new Map((project.cameraRigs || []).map(rig => [rig.id, rig]));
	return tracks.map(track => track.type === 'camera'
		? {
			...track,
			clips: track.clips.map(clip => clip.rig
				? expandRigClip(clip, custom.get(clip.rig) || PRESETS[clip.rig])
				: clip)
		}
		: track);
}

function expandRigClip(clip, rig) {
	if (!rig) throw new Error(`Unknown camera rig: ${clip.rig}`);
	const anchor = point(clip.anchor || rig.anchor || {});
	const target = resolveTarget(clip, rig, anchor);
	const fromPosition = resolvePosition(clip.fromOffset, rig.fromOffset, rig.position, anchor);
	const toPosition = resolvePosition(clip.toOffset, rig.toOffset, rig.toPosition || rig.position, anchor);
	const fieldOfView = finiteLens(clip.fieldOfView ?? rig.fieldOfView);
	return {
		...clip,
		easing: clip.easing || rig.easing || 'easeInOutCubic',
		...(fieldOfView == null ? {} : { fieldOfView }),
		from: cameraEndpoint(fromPosition, target, clip.targetActor),
		shot: clip.shot || clip.rig,
		to: cameraEndpoint(toPosition, target, clip.targetActor)
	};
}

function resolveTarget(clip, rig, anchor) {
	if (clip.target) return point(clip.target);
	if (!rig.target) return anchor;
	return rig.position ? point(rig.target) : add(anchor, point(rig.target));
}

function resolvePosition(clipOffset, rigOffset, absolute, anchor) {
	if (clipOffset) return add(anchor, point(clipOffset));
	if (rigOffset) return add(anchor, point(rigOffset));
	return point(absolute || anchor);
}

function cameraEndpoint(position, target, targetActor) {
	return targetActor
		? { position, targetActor: String(targetActor) }
		: { position, target };
}

function preset(fromOffset, toOffset, easing) {
	return Object.freeze({
		easing,
		fromOffset: Object.freeze(point(fromOffset)),
		toOffset: Object.freeze(point(toOffset))
	});
}

function finiteLens(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(15, Math.min(120, number)) : null;
}

function point(value = {}) {
	if (Array.isArray(value)) {
		return { x: Number(value[0] || 0), y: Number(value[1] || 0), z: Number(value[2] || 0) };
	}
	return { x: Number(value.x || 0), y: Number(value.y || 0), z: Number(value.z || 0) };
}

function add(left, right) {
	return { x: left.x + right.x, y: left.y + right.y, z: left.z + right.z };
}

export const MOVIE_CAMERA_RIG_PRESETS = Object.freeze(Object.keys(PRESETS));
