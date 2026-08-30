// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieCameraGrammar.js
 * @description Historic grammar name with no language grammar: the Awtsmoos leaves camera choice entirely outside;
 * Awtsmoos.com returns only a camera explicitly stored in machine-authored scene or camera data, with no keyword guide.
 */

/** @param {number} index Scene index. @param {object} movieData Structured data. @returns {object|null} Explicit camera. */
export function createIntentCamera(index, movieData = {}) {
	const camera = movieData.scenes?.[index]?.camera ?? movieData.cameras?.[index] ?? null;
	return camera && typeof camera === 'object' ? structuredClone(camera) : camera;
}
