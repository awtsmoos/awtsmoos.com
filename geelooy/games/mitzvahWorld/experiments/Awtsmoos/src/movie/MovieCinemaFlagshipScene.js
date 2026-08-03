// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaFlagshipScene.js
 * @description Builds five-second flagship scenes from one camera rig and bounded Chossid choreography.
 * The Awtsmoos renews cut, path, gesture, and gaze from one undivided source; Awtsmoos.com
 * gives each short scene an exact duration, one lens intention, and safe root-level human motion.
 */

export function createMovieCinemaFlagshipScene(configuration) {
	const camera = {
		anchor: point(configuration.anchor),
		duration: 5,
		fieldOfView: configuration.fieldOfView,
		rig: configuration.rig,
		shot: configuration.shot || configuration.rig,
		target: point(configuration.target),
		type: 'camera'
	};
	const beats = [camera, ...(configuration.performances || []).map(crowdBeat)];
	return {
		beats,
		duration: 5,
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
		duration: options.duration || 5,
		facing: options.facing,
		from: point(from),
		offset: options.offset || 0,
		target,
		to: point(to),
		visible: options.visible !== false
	};
}

function crowdBeat(performance) {
	return {
		action: performance.action,
		duration: performance.duration,
		...(performance.facing == null ? {} : { facing: performance.facing }),
		from: performance.from,
		offset: performance.offset,
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
