//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SharedToCoreMovie.js
 * @description The studio covenant returns to the deterministic core while the Awtsmoos preserves duration, scene, cast, and light;
 * Awtsmoos.com carries shared-only protocol vessels through a namespaced envelope so mature authored movies can return without loss in sight.
 */
import { createMovieDocument } from "../../../../libs/awtsmoos-movie-core/index.js";
import {
	sharedCameraToCore,
	sharedTransitionToCore
} from "./BridgeCameraTransition.js";
import { createCoreMetadataFromShared } from "./BridgeSharedEnvelope.js";
import { inferCoreSceneMode } from "./BridgeSceneMode.js";
import { convertSharedLayerToCoreEntity } from "./SharedLayerToEntity.js";

/**
 * @description Converts one shared awtsmoos-movie-v1 document into deterministic-core form.
 * @param {object} sharedMovie - Canonical shared-protocol movie document.
 * @returns {object} Deterministic-core movie document carrying shared-only envelope metadata.
 * @sideEffects None outside newly allocated clones.
 */
export function convertSharedMovieToCore(sharedMovie) {
	const movie = sharedMovie || {};
	return createMovieDocument({
		id: movie.id,
		title: movie.metadata?.title || "Shared Awtsmoos Movie",
		duration: Number(movie.duration) || 0,
		fps: Number(movie.format?.fps) || 30,
		aspectRatio: resolveAspectRatio(movie.format),
		personality: movie.metadata?.personality || "animator",
		assets: structuredClone(movie.assets || []),
		scenes: (movie.scenes || []).map(convertSharedScene),
		metadata: createCoreMetadataFromShared(movie)
	});
}

/**
 * @description Converts one shared scene into deterministic-core form.
 * @param {object} scene - Canonical shared scene.
 * @returns {object} Deterministic-core scene.
 * @sideEffects None.
 */
function convertSharedScene(scene) {
	return {
		id: scene?.id,
		start: Number(scene?.start) || 0,
		duration: Number(scene?.duration) || 0,
		mode: inferCoreSceneMode(scene),
		background: structuredClone(scene?.background || {}),
		camera: sharedCameraToCore(scene?.camera),
		entities: (scene?.layers || []).map(function convertLayer(layer) {
			return convertSharedLayerToCoreEntity(layer, scene);
		}),
		transition: sharedTransitionToCore(scene?.transition)
	};
}

/**
 * @description Resolves shared pixel dimensions into the nearest canonical core aspect-ratio label.
 * @param {object} format - Shared movie format.
 * @returns {string} Canonical aspect-ratio label.
 * @sideEffects None.
 */
function resolveAspectRatio(format = {}) {
	const width = Number(format.width) || 16;
	const height = Number(format.height) || 9;
	if (Math.abs(width - height) < 1) {
		return "1:1";
	}
	if (height > width) {
		return "9:16";
	}
	const ratio = width / height;
	return Math.abs(ratio - (4 / 3)) < 0.08 ? "4:3" : "16:9";
}
