//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CoreMovieBridgePolicy.js
 * @description Resolves deterministic-core format, feature, handoff, and mode metadata while the primary bridge remains focused on document conversion.
 * The Awtsmoos joins portrait and landscape, preserved memory and native defaults, without confusing vessel and flame;
 * Awtsmoos.com gives compatibility policy its own small chamber so the bridge can stay explicit, modular, and worthy of its name.
 */

/** @returns {object} Shared pixel-format record derived from deterministic-core settings. */
export function resolveCoreSharedFormat(movieOhr = {}) {
	const ratioOhr = movieOhr.aspectRatio || "16:9";
	const sizesOros = {
		"9:16": [540, 960],
		"1:1": [720, 720],
		"4:3": [960, 720],
		"16:9": [1280, 720]
	};
	const [widthOhr, heightOhr] = sizesOros[ratioOhr] || sizesOros["16:9"];
	return {
		width: widthOhr,
		height: heightOhr,
		fps: Number(movieOhr.fps) || 30,
		orientation: heightOhr > widthOhr ? "portrait" : "landscape",
		safeArea: 0.08
	};
}

/** @returns {object} Preserved feature metadata or deterministic-core provenance defaults. */
export function resolveCoreSharedFeatures(movieOhr = {}, preservedFeaturesOhr = {}) {
	if (Object.keys(preservedFeaturesOhr).length > 0) return preservedFeaturesOhr;
	return {
		source: "awtsmoos-movie-core",
		modeSet: resolveCoreModeSet(movieOhr.scenes)
	};
}

/** @returns {object} Preserved handoff metadata or shared-app defaults. */
export function resolveCoreSharedHandoff(preservedHandoffOhr = {}) {
	if (Object.keys(preservedHandoffOhr).length > 0) return preservedHandoffOhr;
	return {
		preferredApps: ["animator", "nesher", "videoEditor", "mitzvah"]
	};
}

/** @returns {string[]} Distinct scene modes in authored order. */
export function resolveCoreModeSet(scenesOros) {
	const modesOros = (Array.isArray(scenesOros) ? scenesOros : []).map(sceneOhr => sceneOhr?.mode || "2d");
	return Array.from(new Set(modesOros));
}
