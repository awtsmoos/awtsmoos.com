//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CoreToSharedMovie.js
 * @description The deterministic core enters the mature studio covenant while the Awtsmoos preserves each measured scene and shared outer flame;
 * Awtsmoos.com keeps this converter focused on scene translation while format, feature, and handoff defaults shine from their own named frame.
 */
import { normalizeMovie } from "../MovieNormalizer.js";
import { createMovieDocument } from "../MovieProtocol.js";
import {
	coreCameraToShared,
	coreTransitionToShared
} from "./BridgeCameraTransition.js";
import {
	resolveSharedFeatures,
	resolveSharedFormat,
	resolveSharedHandoff
} from "./BridgeCoreSharedDefaults.js";
import {
	createSharedMetadataFromCore,
	readSharedEnvelope
} from "./BridgeSharedEnvelope.js";
import { convertCoreEntityToSharedLayer } from "./CoreEntityToLayer.js";

/**
 * @description Converts one deterministic-core movie into the shared awtsmoos-movie-v1 protocol.
 * @param {object} coreMovie - Deterministic-core movie document.
 * @returns {object} Normalized shared-protocol movie document.
 * @sideEffects None outside newly allocated clones.
 */
export function convertCoreMovieToShared(coreMovie) {
	const movie = coreMovie || {};
	const envelope = readSharedEnvelope(movie);
	return normalizeMovie(createMovieDocument({
		id: movie.id,
		metadata: createSharedMetadataFromCore(movie),
		format: resolveSharedFormat(movie),
		duration: Number(movie.duration) || 0,
		cast: envelope.cast,
		assets: structuredClone(movie.assets || []),
		features: resolveSharedFeatures(movie, envelope.features),
		scenes: (movie.scenes || []).map(convertCoreScene),
		handoff: resolveSharedHandoff(envelope.handoff)
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
