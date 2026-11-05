// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaFlagshipScene.js
 * @description Builds measured flagship scenes with one camera, safe Chossid motion, dialogue, and ambience.
 * The Awtsmoos renews gaze, footstep, speech, and breeze before any timeline can divide them;
 * Awtsmoos.com keeps every finite beat bounded while the real game remains the source of world motion.
 */

const DEFAULT_SCENE_DURATION = 10;

export function createMovieCinemaFlagshipScene(configuration = {}) {
	const duration = positiveDuration(configuration.duration, DEFAULT_SCENE_DURATION);
	const camera = {
		anchor: point(configuration.anchor),
		duration,
		fieldOfView: configuration.fieldOfView,
		rig: configuration.rig,
		shot: configuration.shot || configuration.rig,
		target: point(configuration.target),
		type: 'camera'
	};
	const performances = (configuration.performances || [])
		.map(performance => crowdBeat(performance, duration));
	return {
		beats: [camera, ...performances, ...(configuration.beats || [])],
		duration,
		grade: configuration.grade,
		id: configuration.id,
		label: configuration.label,
		transition: configuration.transition || 'cut',
		world: configuration.world
	};
}

export function movieCinemaPerformance(target, action, from, to, options = {}) {
	return {
		action,
		duration: options.duration == null ? null : positiveDuration(options.duration, DEFAULT_SCENE_DURATION),
		facing: options.facing,
		from: point(from),
		offset: nonNegative(options.offset),
		target,
		to: point(to),
		visible: options.visible !== false
	};
}

export function movieCinemaDialogue(speaker, text, options = {}) {
	return {
		duration: positiveDuration(options.duration, 3),
		offset: nonNegative(options.offset),
		speaker: String(speaker || ''),
		text: String(text || ''),
		type: 'dialogue'
	};
}

export function movieCinemaAmbience(kind, options = {}) {
	return {
		duration: positiveDuration(options.duration, DEFAULT_SCENE_DURATION),
		frequency: Number(options.frequency || 96),
		offset: nonNegative(options.offset),
		kind: String(kind || 'wind'),
		type: 'audio',
		volume: Number(options.volume || 0.025)
	};
}

function crowdBeat(performance, sceneDuration) {
	const offset = nonNegative(performance.offset);
	const duration = performance.duration || Math.max(0.001, sceneDuration - offset);
	return {
		action: performance.action,
		duration,
		...(performance.facing == null ? {} : { facing: performance.facing }),
		from: performance.from,
		offset,
		target: performance.target,
		to: performance.to,
		type: 'crowd',
		visible: performance.visible
	};
}

function point(value = {}) {
	return {
		x: Number(value.x || 0),
		y: Number(value.y || 0),
		z: Number(value.z || 0)
	};
}

function positiveDuration(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function nonNegative(value) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : 0;
}
