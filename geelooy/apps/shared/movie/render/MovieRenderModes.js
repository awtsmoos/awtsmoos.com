//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieRenderModes.js
 * @description One movie may shine as photograph, as built stage, or as both at once;
 * Awtsmoos.com names the render modes canonically so JSON, validators, renderers, and export agree on the vessel.
 */
import {
	MovieLayerKind,
	binahLayerFamily
} from "../schema/MovieSemanticKinds.js";
import { gevurahIssue } from "../schema/MovieValidationIssue.js";

export const MovieRenderMode = Object.freeze({
	AUTO: "auto",
	TWO_D: "2d",
	THREE_D: "3d",
	HYBRID: "hybrid"
});

/** Every render mode a canonical movie or scene may declare, including explicit auto. */
export const MovieRenderModes = Object.freeze(Object.values(MovieRenderMode));

/** The modes a scene can effectively render in once auto has been resolved. */
export const MovieEffectiveRenderModes = Object.freeze([
	MovieRenderMode.TWO_D,
	MovieRenderMode.THREE_D,
	MovieRenderMode.HYBRID
]);

/** One plain honest line per mode; the Studio UI shows these verbatim. */
export const MOVIE_RENDER_MODE_DESCRIPTIONS = Object.freeze({
	[MovieRenderMode.AUTO]: "Auto: each scene picks 2D, 3D, or Hybrid from its own layers.",
	[MovieRenderMode.TWO_D]: "2D Photo: photographic image plates with camera motion and a cinematic grade. Flat layers only, no 3D stage.",
	[MovieRenderMode.THREE_D]: "3D Stage: a real-time WebGL stage with procedural set pieces and the Chossid model, lit and contact-shadowed. Text stays a screen overlay.",
	[MovieRenderMode.HYBRID]: "Hybrid: the 3D stage as the plate, with 2D images, text, and graphics composited on top."
});

const VISIBLE_STAGE_KINDS = new Set([
	MovieLayerKind.WORLD_3D,
	MovieLayerKind.TERRAIN_3D,
	MovieLayerKind.WATER_3D,
	MovieLayerKind.MODEL_3D,
	MovieLayerKind.CHARACTER_3D,
	MovieLayerKind.PARTICLES_3D,
	MovieLayerKind.GROUP_3D
]);

const DEFAULT_GRADE = Object.freeze({
	enabled: true,
	vignette: 0.32,
	grain: 0.06,
	letterbox: 0,
	temperature: 0
});

/** True when the value is one of the declared canonical render modes. */
export function isMovieRenderMode(orValue) {
	return MovieRenderModes.includes(orValue);
}

/** Describe every render mode for pickers, docs, and error surfaces. */
export function describeMovieRenderModes() {
	return MovieRenderModes.map(orId => ({
		id: orId,
		description: MOVIE_RENDER_MODE_DESCRIPTIONS[orId]
	}));
}

/** Validate movie-level and per-scene render declarations; unknown modes list the accepted ones. */
export function validateMovieRenderModes(orMovie) {
	const ohrIssues = [];
	pushModeIssue(ohrIssues, orMovie?.render?.mode, "render.mode");
	pushGradeIssues(ohrIssues, orMovie?.render?.grade, "render.grade");
	for (const [yesodIndex, orScene] of (orMovie?.scenes || []).entries()) {
		pushModeIssue(ohrIssues, orScene?.render?.mode, `scenes[${yesodIndex}].render.mode`);
		pushGradeIssues(ohrIssues, orScene?.render?.grade, `scenes[${yesodIndex}].render.grade`);
	}
	return ohrIssues;
}

/**
 * Resolve the render mode one scene will actually use.
 * Scene declaration wins over the movie declaration; auto reads the scene's own layers.
 */
export function resolveSceneRenderMode(orMovie, orScene) {
	const keliSceneMode = orScene?.render?.mode;
	if (isMovieRenderMode(keliSceneMode)) {
		return freezeResolution(keliSceneMode, "scene", orScene);
	}
	const keliMovieMode = orMovie?.render?.mode;
	if (isMovieRenderMode(keliMovieMode)) {
		return freezeResolution(keliMovieMode, "movie", orScene);
	}
	return freezeResolution(MovieRenderMode.AUTO, "auto", orScene);
}

/** The mode auto would choose for one scene, from its visible layer families alone. */
export function autoSceneRenderMode(orScene) {
	const keliLayers = orScene?.layers || [];
	const chesedHasStage = keliLayers.some(orLayer => VISIBLE_STAGE_KINDS.has(orLayer?.kind));
	if (!chesedHasStage) return MovieRenderMode.TWO_D;
	const chesedHasScreen = keliLayers.some(orLayer => isScreenLayer(orLayer));
	return chesedHasScreen ? MovieRenderMode.HYBRID : MovieRenderMode.THREE_D;
}

/** Merge movie and scene grade declarations over the cinematic defaults, clamped to sane ranges. */
export function resolveMovieRenderGrade(orMovie, orScene) {
	const keliMerged = {
		...DEFAULT_GRADE,
		...(orMovie?.render?.grade || {}),
		...(orScene?.render?.grade || {})
	};
	return Object.freeze({
		enabled: keliMerged.enabled !== false,
		vignette: clamp(keliMerged.vignette, 0, 0.85, DEFAULT_GRADE.vignette),
		grain: clamp(keliMerged.grain, 0, 0.6, DEFAULT_GRADE.grain),
		letterbox: clamp(keliMerged.letterbox, 0, 0.22, DEFAULT_GRADE.letterbox),
		temperature: clamp(keliMerged.temperature, -1, 1, DEFAULT_GRADE.temperature)
	});
}

function freezeResolution(orRequested, orSource, orScene) {
	return Object.freeze({
		requested: orRequested,
		effective: orRequested === MovieRenderMode.AUTO ? autoSceneRenderMode(orScene) : orRequested,
		source: orSource
	});
}

function isScreenLayer(orLayer) {
	if (!orLayer?.kind || VISIBLE_STAGE_KINDS.has(orLayer.kind)) return false;
	if (orLayer.kind === MovieLayerKind.LIGHT_3D || orLayer.kind === MovieLayerKind.CAMERA) return false;
	return binahLayerFamily(orLayer.kind) !== "audio" || orLayer.kind === MovieLayerKind.DIALOGUE;
}

function pushModeIssue(orIssues, orValue, orPath) {
	if (orValue == null || isMovieRenderMode(orValue)) return;
	orIssues.push(gevurahIssue(
		"RENDER_MODE",
		orPath,
		`Unsupported render mode ${JSON.stringify(orValue)}. Accepted render modes: ${MovieRenderModes.join(", ")}.`
	));
}

function pushGradeIssues(orIssues, orGrade, orPath) {
	if (!orGrade || typeof orGrade !== "object") return;
	for (const yesodField of ["vignette", "grain", "letterbox", "temperature"]) {
		const keliValue = orGrade[yesodField];
		if (keliValue != null && !Number.isFinite(Number(keliValue))) {
			orIssues.push(gevurahIssue(
				"RENDER_GRADE",
				`${orPath}.${yesodField}`,
				`Grade ${yesodField} must be a finite number.`
			));
		}
	}
}

function clamp(orValue, orMin, orMax, orFallback) {
	const keliNumber = Number(orValue);
	if (!Number.isFinite(keliNumber)) return orFallback;
	return Math.min(orMax, Math.max(orMin, keliNumber));
}
