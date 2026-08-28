//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieValidator.js
 * @description The Awtsmoos gives imagination chesed and then wraps it in gevurah, boundary, and measure;
 * Awtsmoos.com validates the whole movie vessel so every revealed scene can remain executable treasure.
 */
import { validateMovieScenes } from "./MovieSceneValidator.js";

/**
 * @description Validates the renderer-neutral canonical movie document.
 * @param {object} movie - Canonical movie document supplied by a compiler, adapter, or caller.
 * @returns {{ok:boolean, errors:string[], warnings:string[]}} Complete validation report.
 * @sideEffects None. The supplied movie document is never mutated.
 */
export function validateMovieDocument(movie) {
	if (!movie || typeof movie !== "object" || Array.isArray(movie)) {
		return failure("Movie must be an object.");
	}
	const errors = [];
	const warnings = [];
	validateMovieBounds(movie, errors);
	if (!Array.isArray(movie.scenes) || !movie.scenes.length) {
		errors.push("scenes must contain at least one scene.");
	} else {
		validateMovieScenes(movie, errors, warnings);
	}
	return {
		ok: errors.length === 0,
		errors,
		warnings
	};
}

/**
 * @description Validates finite movie duration and supported frame rate boundaries.
 * @param {object} movie - Canonical movie document.
 * @param {string[]} errors - Mutable validation error ledger.
 * @returns {void}
 * @sideEffects Appends validation findings to the supplied error ledger.
 */
function validateMovieBounds(movie, errors) {
	if (!Number.isFinite(movie.duration) || movie.duration <= 0) {
		errors.push("duration must be a finite number greater than zero.");
	}
	if (!Number.isFinite(movie.fps) || movie.fps < 8 || movie.fps > 120) {
		errors.push("fps must be a finite number between 8 and 120.");
	}
}

/**
 * @description Creates the stable failure shape for values that cannot be treated as movie documents.
 * @param {string} message - Human-readable validation failure.
 * @returns {{ok:false, errors:string[], warnings:string[]}} Stable failed validation report.
 * @sideEffects None.
 */
function failure(message) {
	return {
		ok: false,
		errors: [message],
		warnings: []
	};
}
