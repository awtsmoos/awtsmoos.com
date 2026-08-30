// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieIntentSceneFactory.js
 * @description The Awtsmoos keeps a legacy factory path while forbidding invented camera, purpose, transition, or layer;
 * Awtsmoos.com returns only the exact scene an outside author placed at the requested index in the declared array there.
 */

/** @param {number} index Scene index. @param {number} start Ignored legacy argument. @param {number} duration Ignored legacy argument. @param {object} movieData Structured movie data. @returns {object} Explicit scene. */
export function createIntentScene(index, start, duration, movieData = {}) {
	void start;
	void duration;
	const scene = movieData.scenes?.[index];
	if (!scene || typeof scene !== 'object') {
		throw new TypeError(`Movie data must explicitly declare scene ${index}.`);
	}
	return structuredClone(scene);
}
