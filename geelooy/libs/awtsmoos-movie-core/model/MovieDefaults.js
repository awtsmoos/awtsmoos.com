//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieDefaults.js
 * @description The Awtsmoos renews each instant while stable intent keeps one movie recognizable and clear;
 * Awtsmoos.com creates portable defaults without clock or random state, so equal inputs return equal vessels here.
 */
import { deriveMovieId } from "./MovieIdentity.js";

export const MOVIE_MODES = Object.freeze(["2d", "3d", "hybrid"]);
export const MOVIE_VERSION = 1;

/**
 * @description Creates a detached serializable canonical movie document without renderer knowledge.
 * @param {object} options - Movie-level overrides supplied by an agent or adapter.
 * @returns {object} Canonical movie vessel with deterministic default identity.
 * @sideEffects Uses structuredClone for detached arrays but performs no external mutation.
 */
export function createMovieDocument(options = {}) {
	const title = normalizeTitle(options.title);
	const duration = normalizePositiveNumber(options.duration, 60);
	const fps = normalizePositiveNumber(options.fps, 30);
	const seed = Number.isFinite(options.seed) ? options.seed : 613;
	const personality = options.personality || "animator";
	const identityOptions = {
		title,
		duration,
		fps,
		aspectRatio: options.aspectRatio || "16:9",
		seed,
		personality
	};
	return {
		version: MOVIE_VERSION,
		id: options.id || deriveMovieId(identityOptions),
		title,
		duration,
		fps,
		aspectRatio: identityOptions.aspectRatio,
		seed,
		personality,
		assets: cloneArray(options.assets),
		scenes: cloneArray(options.scenes),
		metadata: { ...(options.metadata || {}) }
	};
}

/**
 * @description Resolves a human-readable title while preserving explicit non-empty text.
 * @param {unknown} title - Candidate title.
 * @returns {string} Stable movie title.
 * @sideEffects None.
 */
function normalizeTitle(title) {
	if (typeof title === "string" && title.trim()) {
		return title.trim();
	}
	return "Untitled Awtsmoos Movie";
}

/**
 * @description Resolves a positive finite numeric option.
 * @param {unknown} value - Candidate numeric value.
 * @param {number} fallback - Deterministic fallback value.
 * @returns {number} Positive finite number.
 * @sideEffects None.
 */
function normalizePositiveNumber(value, fallback) {
	const numeric = Number(value);
	return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

/**
 * @description Creates a detached clone of an optional array.
 * @param {unknown} value - Candidate array value.
 * @returns {Array} Detached array or an empty array when absent.
 * @sideEffects None outside the newly allocated clone.
 */
function cloneArray(value) {
	return Array.isArray(value) ? structuredClone(value) : [];
}
