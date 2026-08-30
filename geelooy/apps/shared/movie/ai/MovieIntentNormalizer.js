//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieIntentNormalizer.js
 * @description Gathers permissive AI scenes and entities into the canonical seconds-based movie protocol while small value normalizers own clocks and cameras.
 * The Awtsmoos gathers seconds, layers, worlds, and entities into one lawful movie tongue;
 * Awtsmoos.com lets scene composition remain clear while each camera and measure descends through a smaller shining rung.
 */

import { MovieLayerKind } from "../MovieKinds.js";
import { adaptIntentEntity } from "./MovieIntentEntityAdapter.js";
import {
	movieIntentSeconds,
	movieIntentTimeScale,
	normalizeMovieIntentCamera,
	normalizeMovieIntentFormat,
	normalizeMovieIntentTransition
} from "./MovieIntentValueNormalizer.js";

/** Normalize permissive AI intent into the seconds-based canonical protocol vocabulary. */
export function normalizeMovieIntentInput(intentOhr = {}) {
	const scaleOhr = movieIntentTimeScale(intentOhr.timeUnit, intentOhr.format?.fps || intentOhr.settings?.fps);
	const scenesOros = Array.isArray(intentOhr.scenes)
		? intentOhr.scenes.map((sceneOhr, indexOhr) => normalizeScene(sceneOhr, indexOhr, scaleOhr))
		: undefined;
	return {
		...structuredClone(intentOhr),
		duration: movieIntentSeconds(intentOhr.duration, scaleOhr),
		sceneDuration: movieIntentSeconds(intentOhr.sceneDuration, scaleOhr),
		format: normalizeMovieIntentFormat(intentOhr),
		scenes: scenesOros,
		timeUnit: "seconds"
	};
}

function normalizeScene(sceneOhr = {}, indexOhr, scaleOhr) {
	const sourceLayersOros = Array.isArray(sceneOhr.layers) && sceneOhr.layers.length
		? sceneOhr.layers.map(layerOhr => normalizeLayer(layerOhr, scaleOhr))
		: createEntityLayers(sceneOhr.entities || [], sceneOhr, scaleOhr);
	return {
		...structuredClone(sceneOhr),
		id: sceneOhr.id || `intent-scene-${indexOhr + 1}`,
		start: movieIntentSeconds(sceneOhr.start, scaleOhr),
		duration: movieIntentSeconds(sceneOhr.duration, scaleOhr),
		transition: normalizeMovieIntentTransition(sceneOhr.transition, scaleOhr),
		camera: normalizeMovieIntentCamera(sceneOhr.camera || sceneOhr.cameras?.[0]),
		cameras: normalizeSceneCameras(sceneOhr.cameras, scaleOhr),
		layers: sourceLayersOros,
		entities: structuredClone(sceneOhr.entities || [])
	};
}

function normalizeSceneCameras(camerasOros = [], scaleOhr) {
	return camerasOros.map(cameraOhr => ({
		...normalizeMovieIntentCamera(cameraOhr),
		start: movieIntentSeconds(cameraOhr.start, scaleOhr),
		duration: movieIntentSeconds(cameraOhr.duration, scaleOhr)
	}));
}

function createEntityLayers(entitiesOros, sceneOhr, scaleOhr) {
	const layersOros = entitiesOros.map((entityOhr, indexOhr) => adaptIntentEntity(entityOhr, sceneOhr, scaleOhr, indexOhr));
	if (!["3d", "hybrid"].includes(sceneOhr.dimension)) return layersOros;
	layersOros.unshift(createWorldLayer(sceneOhr, scaleOhr));
	layersOros.splice(1, 0, createLightLayer(sceneOhr, scaleOhr));
	return layersOros;
}

function createWorldLayer(sceneOhr, scaleOhr) {
	return {
		id: `${sceneOhr.name || "scene"}-world`,
		kind: MovieLayerKind.WORLD_3D,
		start: 0,
		duration: movieIntentSeconds(sceneOhr.duration, scaleOhr),
		content: { theme: sceneOhr.kind || sceneOhr.name || "cinematic" }
	};
}

function createLightLayer(sceneOhr, scaleOhr) {
	return {
		id: `${sceneOhr.name || "scene"}-light`,
		kind: MovieLayerKind.LIGHT_3D,
		start: 0,
		duration: movieIntentSeconds(sceneOhr.duration, scaleOhr),
		data: { type: "area", intensity: 1.1 }
	};
}

function normalizeLayer(layerOhr = {}, scaleOhr) {
	return {
		...structuredClone(layerOhr),
		start: movieIntentSeconds(layerOhr.start, scaleOhr),
		duration: movieIntentSeconds(layerOhr.duration, scaleOhr),
		keyframes: (layerOhr.keyframes || []).map(frameOhr => ({
			...structuredClone(frameOhr),
			at: movieIntentSeconds(frameOhr.at, scaleOhr)
		}))
	};
}
