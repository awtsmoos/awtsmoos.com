//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CoreToSharedMovie.js
 * @description Converts deterministic-core movies into the mature shared movie protocol while compatibility policy lives in its own focused vessel.
 * The Awtsmoos carries each measured scene from core to studio without losing cast, feature, handoff, layer, camera, or transition flame;
 * Awtsmoos.com keeps the orchestration readable while format and metadata policy descend through a neighboring chamber with the same name.
 */

import { normalizeMovie } from "../MovieNormalizer.js";
import { createMovieDocument } from "../MovieProtocol.js";
import { coreCameraToShared, coreTransitionToShared } from "./BridgeCameraTransition.js";
import { createSharedMetadataFromCore, readSharedEnvelope } from "./BridgeSharedEnvelope.js";
import { convertCoreEntityToSharedLayer } from "./CoreEntityToLayer.js";
import {
	resolveCoreSharedFeatures,
	resolveCoreSharedFormat,
	resolveCoreSharedHandoff
} from "./CoreMovieBridgePolicy.js";

/**
 * @description Converts one deterministic-core movie into the shared awtsmoos-movie-v1 protocol.
 * @param {object} coreMovieOhr Deterministic-core movie document.
 * @returns {object} Normalized shared-protocol movie document.
 */
export function convertCoreMovieToShared(coreMovieOhr) {
	const movieOhr = coreMovieOhr || {};
	const envelopeOhr = readSharedEnvelope(movieOhr);
	return normalizeMovie(createMovieDocument({
		id: movieOhr.id,
		metadata: createSharedMetadataFromCore(movieOhr),
		format: resolveCoreSharedFormat(movieOhr),
		duration: Number(movieOhr.duration) || 0,
		cast: envelopeOhr.cast,
		assets: structuredClone(movieOhr.assets || []),
		features: resolveCoreSharedFeatures(movieOhr, envelopeOhr.features),
		scenes: (movieOhr.scenes || []).map(convertCoreScene),
		handoff: resolveCoreSharedHandoff(envelopeOhr.handoff)
	}));
}

/**
 * @description Converts one deterministic-core scene into one shared-protocol scene.
 * @param {object} sceneOhr Deterministic-core scene.
 * @returns {object} Shared scene with converted entities, camera, and transition.
 */
function convertCoreScene(sceneOhr) {
	return {
		id: sceneOhr?.id,
		name: sceneOhr?.title || sceneOhr?.id,
		start: Number(sceneOhr?.start) || 0,
		duration: Number(sceneOhr?.duration) || 0,
		camera: coreCameraToShared(sceneOhr?.camera),
		transition: coreTransitionToShared(sceneOhr?.transition),
		layers: (sceneOhr?.entities || []).map(entityOhr => convertCoreEntityToSharedLayer(entityOhr, sceneOhr))
	};
}
