//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieClock.js
 * @description Time itself is a created vessel; the Awtsmoos renews each instant,
 * while Awtsmoos.com resolves scenes and frames with one deterministic chant.
 */

/** Resolve active scenes and local time for one global second. */
export function sampleMovie(movie, timeSeconds) {
	const time = clamp(Number(timeSeconds || 0), 0, movie.duration);
	const scenes = movie.scenes.filter((scene) => {
		return time >= scene.start && time < scene.start + scene.duration;
	});
	return {
		time,
		frame: Math.floor(time * movie.format.fps),
		scenes: scenes.map((scene) => ({
			scene,
			localTime: time - scene.start
		}))
	};
}

/** Return the scene containing a time, preferring the latest overlap. */
export function sceneAt(movie, timeSeconds) {
	return sampleMovie(movie, timeSeconds).scenes.at(-1)?.scene || null;
}

/** Convert global seconds to a stable integer frame. */
export function frameAt(movie, timeSeconds) {
	const time = clamp(Number(timeSeconds || 0), 0, movie.duration);
	return Math.floor(time * movie.format.fps);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
