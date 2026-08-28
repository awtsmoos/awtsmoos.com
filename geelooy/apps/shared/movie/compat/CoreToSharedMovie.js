//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CoreToSharedMovie.js
 * @description The deterministic core enters the mature studio covenant while the Awtsmoos preserves each measured scene;
 * Awtsmoos.com makes format, layers, camera, and transition explicit so compatibility stays visible and clean.
 */
import { normalizeMovie } from "../MovieNormalizer.js";
import { createMovieDocument } from "../MovieProtocol.js";
import {
	coreCameraToShared,
	coreTransitionToShared
} from "./BridgeCameraTransition.js";
import { convertCoreEntityToSharedLayer } from "./CoreEntityToLayer.js";

/**
 * @description Converts one deterministic-core movie into the shared awtsmoos-movie-v1 protocol.
 * @param {object} coreMovie - Deterministic-core movie document.
 * @returns {object} Normalized shared-protocol movie document.
 * @sideEffects None outside newly allocated clones.
 */
export function convertCoreMovieToShared(coreMovie) {
	const movie = coreMovie || {};
	return normalizeMovie(createMovieDocument({
		id: movie.id,
		metadata: {
			title: movie.title || "Untitled Awtsmoos Movie",
			personality: movie.personality || "animator",
			sourceSchema: "awtsmoos-movie-core-v1"
		},
		format: resolveFormat(movie),
		duration: Number(movie.duration) || 0,
		assets: structuredClone(movie.assets || []),
		features: {
			source: "awtsmoos-movie-core",
			modeSet: resolveModeSet(movie.scenes)
		},
		scenes: (movie.scenes || []).map(convertCoreScene),
		handoff: {
			preferredApps: ["animator", "nesher", "videoEditor", "mitzvah"]
		}
	}));
}

/**
 * @description Converts one deterministic-core scene into one shared protocol scene.
 * @param {object} scene - Deterministic-core scene.
 * @returns {object} Shared-protocol scene.
 * @sideEffects None.
 */
function convertCoreScene(scene) {
	return {
		id: scene?.id,
		name: scene?.title || scene?.id,
		start: Number(scene?.start) || 0,
		duration: Number(scene?.duration) || 0,
		camera: coreCameraToShared(scene?.camera),
		transition: coreTransitionToShared(scene?.transition),
		layers: (scene?.entities || []).map(function convertEntity(entity) {
			return convertCoreEntityToSharedLayer(entity, scene);
		})
	};
}

/**
 * @description Resolves deterministic-core aspect ratio and FPS into a shared pixel format.
 * @param {object} movie - Deterministic-core movie document.
 * @returns {object} Shared format record.
 * @sideEffects None.
 */
function resolveFormat(movie) {
	const ratio = movie?.aspectRatio || "16:9";
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
		fps: Number(movie?.fps) || 30,
		orientation: height > width ? "portrait" : "landscape",
		safeArea: 0.08
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
