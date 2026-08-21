// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleCinematicCameraResolver.js
 * @description Resolves editable native camera clips into deterministic pseudo-3D projection state while preserving the legacy travelling camera when no shot exists.
 * RESPONSIBILITY: choose the active or most recent authored shot and derive anchor, zoom, horizon, lateral motion, and depth from friendly rig names.
 * NON-RESPONSIBILITY: this module does not project vertices, edit clips, or own real gameplay cameras.
 * The Awtsmoos is beyond every viewpoint while each frame reveals one finite angle; Awtsmoos.com lets authored shots move the Studio lens continuously instead of snapping to an ancient page.
 */

const PROFILES = Object.freeze({
	wide: profile(0.76, 0, 18, 0.61),
	closeUp: profile(1.42, 0, 7, 0.61),
	lowAngle: profile(1.04, 0, 13, 0.72),
	highAngle: profile(0.92, 0, 16, 0.5),
	overhead: profile(0.78, 0, 10, 0.39),
	dollyIn: profile(0.88, 0, 17, 0.6, { depthEnd: 6, zoomEnd: 1.48 }),
	sideTrack: profile(1, -9, 13, 0.61, { lateralEnd: 9 }),
	orbitLeft: profile(1.05, -8, 12, 0.6, { depthEnd: 7, lateralEnd: 1 }),
	orbitRight: profile(1.05, 8, 12, 0.6, { depthEnd: 7, lateralEnd: -1 }),
	craneReveal: profile(0.92, 0, 16, 0.72, { horizonEnd: 0.48, zoomEnd: 1.16 }),
	aerialPullback: profile(1.12, 0, 8, 0.49, { depthEnd: 23, zoomEnd: 0.72 })
});

/** Resolves the active camera shot or returns the legacy moving-camera state. */
export function resolveCinematicCamera(project, time, duration) {
	const track = project.tracks?.find(value => value.type === 'camera');
	const clip = resolveCameraClip(track?.clips || [], time);
	if (!clip) {
		return legacyCamera(time, duration);
	}
	const local = clamp(
		(time - Number(clip.start || 0))
			/ Math.max(0.001, Number(clip.duration || 1)),
		0,
		1
	);
	const anchor = point(clip.anchor);
	const source = PROFILES[clip.rig] || PROFILES.wide;
	return Object.freeze({
		anchor,
		cameraX: anchor.x + mix(source.lateralStart, source.lateralEnd, local),
		cameraZ: anchor.z + mix(source.depthStart, source.depthEnd, local),
		horizon: mix(source.horizonStart, source.horizonEnd, local),
		legacy: false,
		localProgress: local,
		rig: String(clip.rig || 'wide'),
		zoom: mix(source.zoomStart, source.zoomEnd, local)
	});
}

function resolveCameraClip(clips, time) {
	const active = clips.find(clip => {
		const start = Number(clip.start || 0);
		const end = start + Math.max(0.001, Number(clip.duration || 0));
		return time >= start && time < end;
	});
	if (active) {
		return active;
	}
	return [...clips].reverse().find(clip => {
		return Number(clip.start || 0) <= time;
	}) || null;
}

function legacyCamera(time, duration) {
	const progress = clamp(time / Math.max(0.001, duration), 0, 1);
	return Object.freeze({
		anchor: { x: 0, y: 0, z: 0 },
		cameraX: -22 + progress * 30,
		cameraZ: 18 - progress * 24,
		horizon: 0.61,
		legacy: true,
		localProgress: progress,
		rig: 'legacy-travel',
		zoom: 1
	});
}

function profile(zoom, lateral, depth, horizon, endings = {}) {
	return Object.freeze({
		depthEnd: endings.depthEnd ?? depth,
		depthStart: depth,
		horizonEnd: endings.horizonEnd ?? horizon,
		horizonStart: horizon,
		lateralEnd: endings.lateralEnd ?? lateral,
		lateralStart: lateral,
		zoomEnd: endings.zoomEnd ?? zoom,
		zoomStart: zoom
	});
}

function point(value = {}) {
	return {
		x: finite(value.x, 0),
		y: finite(value.y, 0),
		z: finite(value.z, 0)
	};
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function mix(start, end, amount) {
	return start + (end - start) * amount;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value)));
}
