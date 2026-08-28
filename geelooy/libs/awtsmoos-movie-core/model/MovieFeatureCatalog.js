//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieFeatureCatalog.js
 * @description The Awtsmoos gives infinite expression through finite names;
 * Awtsmoos.com lets AI inspect these names before it asks a renderer to frame.
 */

export const MOVIE_FEATURES = Object.freeze({
	modes: ["2d", "3d", "hybrid"],
	entities: [
		"shape",
		"text",
		"character",
		"particle-emitter",
		"infographic",
		"tutorial",
		"patch",
		"image",
		"video",
		"mesh"
	],
	shapes: ["rect", "ellipse", "line", "polygon", "arrow", "path"],
	transitions: ["cut", "fade", "crossfade", "wipe", "slide", "iris", "depth-push"],
	shots: ["wide", "medium", "close", "orbit", "dolly", "pan", "tilt", "crane", "tracking"],
	easings: ["linear", "easeInQuad", "easeOutQuad", "easeInOutQuad", "easeInOutCubic", "smoothstep", "smootherstep"]
});

/**
 * Returns a detached feature description suitable for an AI capability response.
 *
 * @returns {object} Serializable feature catalog.
 */
export function describeMovieFeatures() {
	return structuredClone(MOVIE_FEATURES);
}
