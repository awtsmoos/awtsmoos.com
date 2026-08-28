//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieCapabilities.js
 * @description The Awtsmoos is One while every studio keeps a distinctive art;
 * Awtsmoos.com names strengths and limits so AI chooses each vessel's proper part.
 */
import { MovieLayerKind, MovieLayerKinds } from "./MovieKinds.js";
import { yesodProtocolIdentity } from "./MovieProtocol.js";

const VISUAL_2D = [
	MovieLayerKind.SHAPE_2D,
	MovieLayerKind.TEXT,
	MovieLayerKind.PATH_2D,
	MovieLayerKind.CHART,
	MovieLayerKind.PARTICLES_2D,
	MovieLayerKind.CHARACTER_2D,
	MovieLayerKind.GROUP_2D,
	MovieLayerKind.OVERLAY,
	MovieLayerKind.IMAGE,
	MovieLayerKind.VIDEO,
	MovieLayerKind.CAPTION,
	MovieLayerKind.MASK,
	MovieLayerKind.MATTE,
	MovieLayerKind.ADJUSTMENT,
	MovieLayerKind.DATA,
	MovieLayerKind.DIAGRAM,
	MovieLayerKind.CODE,
	MovieLayerKind.FORMULA,
	MovieLayerKind.DEVICE
];
const AUDIO = [
	MovieLayerKind.AUDIO,
	MovieLayerKind.DIALOGUE,
	MovieLayerKind.NARRATION,
	MovieLayerKind.MUSIC,
	MovieLayerKind.AMBIENCE,
	MovieLayerKind.SFX
];
const SPATIAL = MovieLayerKinds.filter(orKind => String(orKind).endsWith("3d") || orKind === MovieLayerKind.CAMERA);

const PROFILES = Object.freeze({
	shared: profile("Shared Movie", MovieLayerKinds, ["2d", "3d", "hybrid"], ["interchange", "ai-authoring", "validation", "patch-history"]),
	animator: profile("Awtsmoos Animator", MovieLayerKinds, ["2d", "3d", "hybrid"], ["procedural-generation", "cinematic-cameras", "characters", "particles", "rendering", "export"]),
	nesher: profile("Nesher Studio", MovieLayerKinds, ["2d", "3d", "hybrid"], ["nle", "timeline", "audio", "media-editing", "compositing", "export"], ["spatial semantics can be represented as editable handoff clips"]),
	videoEditor: profile("Video Editor", [...VISUAL_2D, ...AUDIO], ["2d", "hybrid"], ["fast-timeline", "captions", "media-clips", "audio", "mobile-editing"], ["3d layers remain canonical handoff metadata"]),
	mitzvah: profile("Mitzvah Studio", [...VISUAL_2D, ...SPATIAL], ["2d", "3d", "hybrid"], ["shape-authoring", "text", "spatial-objects", "world-building"], ["audio mixing and advanced NLE semantics are deferred"]),
	captions: profile("Captions", [MovieLayerKind.TEXT, MovieLayerKind.CAPTION, MovieLayerKind.SHAPE_2D, MovieLayerKind.PATH_2D, MovieLayerKind.CHART, MovieLayerKind.OVERLAY, ...AUDIO], ["2d"], ["captions", "kinetic-type", "motion-graphics", "dialogue-timing"], ["spatial layers remain handoff metadata"])
});

/** Return one cloned capability profile safe for AI inspection. */
export function movieCapabilities(orAppId = "shared") {
	return structuredClone(PROFILES[orAppId] || PROFILES.shared);
}

/** Return every app profile for capability-aware AI planning. */
export function allMovieCapabilities() {
	return Object.fromEntries(Object.entries(PROFILES).map(([orId, orValue]) => [orId, structuredClone(orValue)]));
}

function profile(orName, orLayers, orDimensions, orStrengths, orLimitations = []) {
	return Object.freeze({
		...yesodProtocolIdentity(),
		name: orName,
		layers: Object.freeze([...orLayers]),
		dimensions: Object.freeze([...orDimensions]),
		strengths: Object.freeze([...orStrengths]),
		limitations: Object.freeze([...orLimitations]),
		features: Object.freeze(["arbitrary-duration", "structured-ai", "mobile-first", "cross-app-handoff", "reversible-patches"])
	});
}

export const MovieCapabilities = Object.freeze({
	for(orAppId) {
		return movieCapabilities(orAppId);
	},
	all() {
		return allMovieCapabilities();
	}
});
