//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSceneValidator.js
 * @description The Awtsmoos gathers many moments into one ordered story without confusing their names;
 * Awtsmoos.com gives every scene time and mode so infinite intent can enter finite frames.
 */
import { MOVIE_FEATURES } from "./MovieFeatureCatalog.js";
import { validateSceneEntities } from "./MovieEntityValidator.js";

/**
 * @description Validates every scene and enforces movie-wide scene identity.
 * @param {object} movie - Canonical movie document.
 * @param {string[]} errors - Mutable validation error ledger.
 * @param {string[]} warnings - Mutable validation warning ledger.
 * @returns {void}
 * @sideEffects Appends validation findings to the supplied ledgers.
 */
export function validateMovieScenes(movie, errors, warnings) {
	const sceneIds = new Set();
	for (const [index, scene] of movie.scenes.entries()) {
		validateScene(
			scene,
			movie.duration,
			`scenes[${index}]`,
			sceneIds,
			errors,
			warnings
		);
	}
}

/**
 * @description Validates one scene's identity, temporal bounds, mode, and entities.
 * @param {object} scene - Canonical scene object.
 * @param {number} movieDuration - Canonical movie duration in seconds.
 * @param {string} scenePath - Human-readable canonical document path for diagnostics.
 * @param {Set<string>} sceneIds - Movie-wide scene identifier registry.
 * @param {string[]} errors - Mutable validation error ledger.
 * @param {string[]} warnings - Mutable validation warning ledger.
 * @returns {void}
 * @sideEffects Mutates the scene identifier registry and validation ledgers.
 */
function validateScene(scene, movieDuration, scenePath, sceneIds, errors, warnings) {
	if (!scene || typeof scene !== "object" || Array.isArray(scene)) {
		errors.push(`${scenePath} must be an object.`);
		return;
	}
	const sceneId = typeof scene.id === "string" ? scene.id.trim() : "";
	if (!sceneId) {
		errors.push(`${scenePath}.id must be a non-empty string.`);
	} else if (sceneIds.has(sceneId)) {
		errors.push(`Duplicate scene id: ${sceneId}.`);
	} else {
		sceneIds.add(sceneId);
	}
	const start = Number(scene.start);
	const duration = Number(scene.duration);
	validateSceneTiming(start, duration, movieDuration, scenePath, errors);
	if (!MOVIE_FEATURES.modes.includes(scene.mode)) {
		errors.push(`${scenePath} has unsupported mode ${scene.mode}.`);
	}
	validateSceneEntities(scene, duration, scenePath, errors, warnings);
}

/**
 * @description Validates finite scene timing and protects the movie duration boundary.
 * @param {number} start - Scene start time in seconds.
 * @param {number} duration - Scene duration in seconds.
 * @param {number} movieDuration - Canonical movie duration in seconds.
 * @param {string} scenePath - Human-readable canonical document path for diagnostics.
 * @param {string[]} errors - Mutable validation error ledger.
 * @returns {void}
 * @sideEffects Appends validation findings to the supplied error ledger.
 */
function validateSceneTiming(start, duration, movieDuration, scenePath, errors) {
	if (!Number.isFinite(start) || start < 0) {
		errors.push(`${scenePath}.start must be a finite non-negative number.`);
	}
	if (!Number.isFinite(duration) || duration <= 0) {
		errors.push(`${scenePath}.duration must be a finite positive number.`);
	}
	if (
		Number.isFinite(start)
		&& Number.isFinite(duration)
		&& start + duration > movieDuration + 0.001
	) {
		errors.push(`${scenePath} exceeds movie duration.`);
	}
}
