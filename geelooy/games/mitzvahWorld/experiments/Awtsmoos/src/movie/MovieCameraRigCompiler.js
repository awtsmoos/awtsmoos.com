// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCameraRigCompiler.js
 * @description Expands cinematic rig presets into canonical camera endpoints without undefined fields.
 * The Awtsmoos renews one subject through crane, dolly, orbit, track, and reveal;
 * Awtsmoos.com compiles expressive names into finite JSON where absent capabilities never congeal.
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
	return tracks.map(track => {
		if (track.type !== 'camera') return track;
		return {
			...track,
			clips: track.clips.map(clip => clip.rig
				? expandRigClip(clip, custom.get(clip.rig) || PRESETS[clip.rig])
				: clip)
		};
	});
}

function expandRigClip(clip, rig) {
	if (!rig) throw new Error(`Unknown camera rig: ${clip.rig}`);
	const anchor = point(clip.anchor || rig.anchor || {});
	const target = clip.target
		? point(clip.target)
		: rig.target
			? add(anchor, point(rig.target))
			: anchor;
	const fromOffset = point(clip.fromOffset || rig.fromOffset);
	const toOffset = point(clip.toOffset || rig.toOffset);
	return {
		...clip,
		easing: clip.easing || rig.easing || 'easeInOutCubic',
		from: cameraEndpoint(add(anchor, fromOffset), target, clip.targetActor),
		shot: clip.shot || clip.rig,
		to: cameraEndpoint(add(anchor, toOffset), target, clip.targetActor)
	};
}

function cameraEndpoint(position, target, targetActor) {
	if (targetActor) return { position, targetActor: String(targetActor) };
	return { position, target };
}

function preset(fromOffset, toOffset, easing) {
	return Object.freeze({
		easing,
		fromOffset: Object.freeze(point(fromOffset)),
		toOffset: Object.freeze(point(toOffset))
	});
}

function point(value = {}) {
	if (Array.isArray(value)) {
		return {
			x: Number(value[0] || 0),
			y: Number(value[1] || 0),
			z: Number(value[2] || 0)
		};
	}
	return {
		x: Number(value.x || 0),
		y: Number(value.y || 0),
		z: Number(value.z || 0)
	};
}

function add(left, right) {
	return {
		x: left.x + right.x,
		y: left.y + right.y,
		z: left.z + right.z
	};
}

export const MOVIE_CAMERA_RIG_PRESETS = Object.freeze(Object.keys(PRESETS));
