//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCoreBridge.js
 * @description Two movie vessels meet without losing their names while the Awtsmoos renews both sides of the seam;
 * Awtsmoos.com exposes explicit conversion gates so deterministic compilation and mature studio runtime share one dream.
 */
import { isAwtsmoosMovie } from "../MovieProtocol.js";
import { convertCoreMovieToShared } from "./CoreToSharedMovie.js";
import { convertSharedMovieToCore } from "./SharedToCoreMovie.js";

/**
 * @description Converts either recognized movie shape into the shared awtsmoos-movie-v1 protocol.
 * @param {object} movie - Shared-protocol or deterministic-core movie document.
 * @returns {object} Shared-protocol movie document.
 * @throws {TypeError} When the supplied value is not an object-like movie document.
 * @sideEffects None outside newly allocated clones.
 */
export function toSharedMovie(movie) {
	assertMovieObject(movie);
	if (isAwtsmoosMovie(movie)) {
		return structuredClone(movie);
	}
	return convertCoreMovieToShared(movie);
}

/**
 * @description Converts either recognized movie shape into deterministic-core form.
 * @param {object} movie - Shared-protocol or deterministic-core movie document.
 * @returns {object} Deterministic-core movie document.
 * @throws {TypeError} When the supplied value is not an object-like movie document.
 * @sideEffects None outside newly allocated clones.
 */
export function toCoreMovie(movie) {
	assertMovieObject(movie);
	if (isAwtsmoosMovie(movie)) {
		return convertSharedMovieToCore(movie);
	}
	return structuredClone(movie);
}

/**
 * @description Reports which side of the compatibility seam currently owns the supplied movie shape.
 * @param {object} movie - Candidate movie document.
 * @returns {string} "shared" for awtsmoos-movie-v1, otherwise "core" for object-like core documents.
 * @throws {TypeError} When the supplied value is not object-like.
 * @sideEffects None.
 */
export function detectMovieSchema(movie) {
	assertMovieObject(movie);
	return isAwtsmoosMovie(movie) ? "shared" : "core";
}

/**
 * @description Rejects primitive values before they cross the compatibility seam.
 * @param {unknown} movie - Candidate movie value.
 * @returns {void}
 * @throws {TypeError} When movie is null, non-object, or an array.
 * @sideEffects None.
 */
function assertMovieObject(movie) {
	if (!movie || typeof movie !== "object" || Array.isArray(movie)) {
		throw new TypeError("Movie compatibility bridge requires an object document.");
	}
}

export { convertCoreMovieToShared, convertSharedMovieToCore };
