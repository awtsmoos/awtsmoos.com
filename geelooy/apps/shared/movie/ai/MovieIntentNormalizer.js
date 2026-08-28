//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieIntentNormalizer.js
 * @description The Awtsmoos gathers entities and scenes into one cinematic tongue;
 * Awtsmoos.com lets AI speak freely while resolved dimensions keep each renderer strong.
 */
import { MovieLayerKind } from "../MovieKinds.js";
import { adaptIntentEntity } from "./MovieIntentEntityAdapter.js";
import {
	movieSeconds,
	movieTimeScale,
	normalizeIntentCamera,
	normalizeIntentFormat,
	normalizeIntentLayer,
	normalizeIntentTransition,
	normalizeTimedIntentCamera
} from "./MovieIntentNormalizationPrimitives.js";

/** Normalize permissive AI intent into the seconds-based canonical vocabulary. */
export function normalizeMovieIntentInput(intent = {}) {
	const yesodScale = movieTimeScale(intent.timeUnit, intent.format?.fps || intent.settings?.fps);
	const keliScenes = Array.isArray(intent.scenes)
		? intent.scenes.map((scene, index) => normalizeScene(scene, index, yesodScale))
		: undefined;
	return {
		...structuredClone(intent),
		duration: movieSeconds(intent.duration, yesodScale),
		sceneDuration: movieSeconds(intent.sceneDuration, yesodScale),
		format: normalizeIntentFormat(intent),
		scenes: keliScenes,
		timeUnit: "seconds"
	};
}

/** Resolve one scene so every adapted entity receives the same canonical dimension. */
function normalizeScene(scene = {}, index, yesodScale) {
	const keliScene = {
		...structuredClone(scene),
		dimension: scene.dimension || "hybrid"
	};
	const ohrLayers = Array.isArray(scene.layers) && scene.layers.length
		? scene.layers.map(layer => normalizeIntentLayer(layer, yesodScale))
		: entityLayers(scene.entities || [], keliScene, yesodScale);
	return {
		...keliScene,
		id: scene.id || `intent-scene-${index + 1}`,
		start: movieSeconds(scene.start, yesodScale),
		duration: movieSeconds(scene.duration, yesodScale),
		transition: normalizeIntentTransition(scene.transition, yesodScale),
		camera: normalizeIntentCamera(scene.camera || scene.cameras?.[0]),
		cameras: (scene.cameras || []).map(camera => normalizeTimedIntentCamera(camera, yesodScale)),
		layers: ohrLayers,
		entities: structuredClone(scene.entities || [])
	};
}

/** Adapt free-form entities and reveal minimal spatial vessels for 3D/hybrid scenes. */
function entityLayers(entities, scene, yesodScale) {
	const ohrLayers = entities.map((entity, index) => adaptIntentEntity(entity, scene, yesodScale, index));
	if (["3d", "hybrid"].includes(scene.dimension)) {
		ohrLayers.unshift(spatialWorld(scene, yesodScale));
		ohrLayers.splice(1, 0, spatialLight(scene, yesodScale));
	}
	return ohrLayers;
}

function spatialWorld(scene, yesodScale) {
	return {
		id: `${scene.name || "scene"}-world`,
		kind: MovieLayerKind.WORLD_3D,
		start: 0,
		duration: movieSeconds(scene.duration, yesodScale),
		content: { theme: scene.kind || scene.name || "cinematic" }
	};
}

function spatialLight(scene, yesodScale) {
	return {
		id: `${scene.name || "scene"}-light`,
		kind: MovieLayerKind.LIGHT_3D,
		start: 0,
		duration: movieSeconds(scene.duration, yesodScale),
		data: { type: "area", intensity: 1.1 }
	};
}
