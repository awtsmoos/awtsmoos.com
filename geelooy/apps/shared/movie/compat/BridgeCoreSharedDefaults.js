//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BridgeCoreSharedDefaults.js
 * @description The Awtsmoos gives a compact core movie the outer studio vessels it did not originally carry;
 * Awtsmoos.com keeps format, feature, and handoff defaults together so the bridge can stay small, explicit, and airy.
 */

/**
 * @description Resolves deterministic-core aspect ratio and FPS into a shared-protocol pixel format.
 * @param {object} movie - Deterministic-core movie document.
 * @returns {object} Shared-protocol format record.
 * @sideEffects None.
 */
export function resolveSharedFormat(movie = {}) {
	const ratio = movie.aspectRatio || "16:9";
	const sizes = {
		"9:16": [540, 960],
		"1:1": [720, 720],
		"4:3": [960, 720],
		"16:9": [1280, 720]
	};
	const [width, height] = sizes[ratio] || sizes["16:9"];
	return {
		width,
		height,
		fps: Number(movie.fps) || 30,
		orientation: height > width ? "portrait" : "landscape",
		safeArea: 0.08
	};
}

/**
 * @description Restores preserved shared features or creates feature metadata for a native-core movie.
 * @param {object} movie - Deterministic-core movie document.
 * @param {object} preservedFeatures - Shared feature record preserved by the bridge envelope.
 * @returns {object} Shared-protocol feature record.
 * @sideEffects None.
 */
export function resolveSharedFeatures(movie, preservedFeatures = {}) {
	if (Object.keys(preservedFeatures).length > 0) {
		return preservedFeatures;
	}
	return {
		source: "awtsmoos-movie-core",
		modeSet: resolveModeSet(movie?.scenes)
	};
}

/**
 * @description Restores preserved shared handoff data or creates native-core application defaults.
 * @param {object} preservedHandoff - Shared handoff record preserved by the bridge envelope.
 * @returns {object} Shared-protocol handoff record.
 * @sideEffects None.
 */
export function resolveSharedHandoff(preservedHandoff = {}) {
	if (Object.keys(preservedHandoff).length > 0) {
		return preservedHandoff;
	}
	return {
		preferredApps: ["animator", "nesher", "videoEditor", "mitzvah"]
	};
}

/**
 * @description Collects distinct deterministic-core scene modes for shared feature metadata.
 * @param {unknown} scenes - Candidate deterministic-core scene collection.
 * @returns {string[]} Distinct scene modes in source order.
 * @sideEffects None.
 */
function resolveModeSet(scenes) {
	const modes = (Array.isArray(scenes) ? scenes : []).map(function readMode(scene) {
		return scene?.mode || "2d";
	});
	return Array.from(new Set(modes));
}
