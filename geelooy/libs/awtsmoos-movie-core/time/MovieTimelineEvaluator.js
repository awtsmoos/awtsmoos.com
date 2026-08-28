//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelineEvaluator.js
 * @description Every requested timestamp becomes a fresh revelation of state;
 * the Awtsmoos renews the frame, and Awtsmoos.com lets every renderer receive that state.
 */
import { evaluateKeyframes } from "./MovieInterpolator.js";

/**
 * Finds the scene active at a global movie time.
 *
 * @param {object} movie Canonical movie document.
 * @param {number} time Global time in seconds.
 * @returns {object|null} Active scene or null.
 */
export function findActiveScene(movie, time) {
	for (const scene of movie.scenes || []) {
		const sceneEnd = scene.start + scene.duration;
		if (time >= scene.start && time < sceneEnd) return scene;
	}
	if (time === movie.duration) return movie.scenes?.at(-1) || null;
	return null;
}

/**
 * Evaluates all scene entities at an exact global timestamp.
 *
 * @param {object} movie Canonical movie document.
 * @param {number} time Global time in seconds.
 * @returns {object} Deterministic evaluated frame state.
 */
export function evaluateMovieAt(movie, time) {
	const boundedTime = Math.max(0, Math.min(movie.duration, Number(time) || 0));
	const scene = findActiveScene(movie, boundedTime);
	if (!scene) return { time: boundedTime, scene: null, entities: [] };
	const localTime = Math.max(0, boundedTime - scene.start);
	return {
		time: boundedTime,
		localTime,
		scene,
		entities: (scene.entities || []).map(entity => evaluateEntity(entity, localTime))
	};
}

function evaluateEntity(entity, localTime) {
	const evaluated = structuredClone(entity);
	delete evaluated.tracks;
	for (const track of entity.tracks || []) {
		const value = evaluateKeyframes(track.keyframes, localTime);
		if (value !== undefined) setPath(evaluated, track.target, value);
	}
	return evaluated;
}

function setPath(target, path, value) {
	const segments = String(path).split(".").filter(Boolean);
	let vessel = target;
	for (let index = 0; index < segments.length - 1; index += 1) {
		const segment = segments[index];
		if (!vessel[segment] || typeof vessel[segment] !== "object") vessel[segment] = {};
		vessel = vessel[segment];
	}
	vessel[segments.at(-1)] = value;
}
