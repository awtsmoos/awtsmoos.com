//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnimatorMovieAdapter.js
 * @description Animator keeps its cinematic soul while receiving a universal movie tongue;
 * the Awtsmoos joins old and new without erasing either, and Awtsmoos.com lets AI direct every rung.
 */
import { describeMovieFeatures, validateMovieDocument } from "../../../../libs/awtsmoos-movie-core/index.js";

/**
 * Converts canonical scenes into Animator-friendly scene commands without mutating its hot AI core.
 *
 * @param {object} movie Canonical movie document.
 * @returns {object} Animator import package.
 */
export function compileForAnimator(movie) {
	const report = validateMovieDocument(movie);
	if (!report.ok) throw new Error(report.errors.join(" "));
	return {
		format: "awtsmoos-animator-unified-v1",
		duration: movie.duration,
		fps: movie.fps,
		scenes: movie.scenes.map(function compileScene(scene) {
			return {
				id: scene.id,
				start: scene.start,
				duration: scene.duration,
				mode: scene.mode,
				camera: structuredClone(scene.camera || {}),
				commands: (scene.entities || []).map(compileEntity)
			};
		})
	};
}

/**
 * Describes the additive capability bridge for the Animator AI agent.
 *
 * @returns {object} Machine-readable capability contract.
 */
export function describeAnimatorMovieCapability() {
	return {
		id: "unifiedMovie",
		personality: "animator",
		features: describeMovieFeatures(),
		accepts: "awtsmoos-movie-v1"
	};
}

function compileEntity(entity) {
	if (entity.type === "character") {
		return { type: "human", options: structuredClone(entity) };
	}
	if (entity.type === "mesh") {
		return { type: "prop", options: structuredClone(entity) };
	}
	return {
		type: "overlay",
		options: structuredClone(entity)
	};
}
