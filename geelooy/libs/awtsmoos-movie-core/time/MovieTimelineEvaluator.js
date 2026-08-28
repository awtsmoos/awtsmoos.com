//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineEvaluator.js
 * @description Every requested timestamp becomes a fresh revelation of state while the Awtsmoos renews the frame;
 * Awtsmoos.com keeps scene selection separate from entity animation so each law remains small, measured, and named.
 */
import { evaluateSceneEntities } from "./MovieEntityEvaluator.js";

/**
 * @description Finds the scene active at a global movie time.
 * @param {object} movie - Canonical movie document.
 * @param {number} time - Global movie time in seconds.
 * @returns {object|null} Active scene or null when no scene owns the requested time.
 * @sideEffects None.
 */
export function findActiveScene(movie, time) {
	for (const scene of movie.scenes || []) {
		const sceneEnd = scene.start + scene.duration;
		if (time >= scene.start && time < sceneEnd) {
			return scene;
		}
	}
	if (time === movie.duration) {
		return movie.scenes?.at(-1) || null;
	}
	return null;
}

/**
 * @description Evaluates all scene entities at one exact global timestamp.
 * @param {object} movie - Canonical movie document.
 * @param {number} time - Global movie time in seconds.
 * @returns {object} Deterministic evaluated frame state.
 * @sideEffects None outside detached evaluated entity clones.
 */
export function evaluateMovieAt(movie, time) {
	const boundedTime = clampMovieTime(movie, time);
	const scene = findActiveScene(movie, boundedTime);
	if (!scene) {
		return {
			time: boundedTime,
			scene: null,
			entities: []
		};
	}
	const localTime = Math.max(0, boundedTime - scene.start);
	return {
		time: boundedTime,
		localTime,
		scene,
		entities: evaluateSceneEntities(scene.entities, localTime)
	};
}

/**
 * @description Clamps an arbitrary time value to the canonical movie duration.
 * @param {object} movie - Canonical movie document.
 * @param {unknown} time - Candidate global movie time.
 * @returns {number} Finite global movie time within movie bounds.
 * @sideEffects None.
 */
function clampMovieTime(movie, time) {
	const numericTime = Number(time);
	const finiteTime = Number.isFinite(numericTime) ? numericTime : 0;
	const duration = Math.max(0, Number(movie.duration) || 0);
	return Math.max(0, Math.min(duration, finiteTime));
}
