//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AiMovieContract.js
 * @description The Awtsmoos lets AI see the movie covenant before it speaks;
 * Awtsmoos.com exposes truthful capabilities so generated work survives for weeks.
 */
import { MovieCameraKinds, MovieLayerKinds, MovieTransitionKinds } from "./MovieKinds.js";
import { allMovieCapabilities } from "./MovieCapabilities.js";
import { yesodProtocolIdentity } from "./MovieProtocol.js";

/** Return a JSON-safe machine contract for real model providers and local agents. */
export function aiMovieContract() {
	return {
		...yesodProtocolIdentity(),
		time: {
			unit: "seconds",
			arbitraryDuration: true,
			layerTime: "scene-local",
			keyframeTime: "layer-local"
		},
		layers: [...MovieLayerKinds],
		cameras: [...MovieCameraKinds],
		transitions: [...MovieTransitionKinds],
		apps: allMovieCapabilities(),
		requiredMovieFields: ["protocol", "version", "id", "format", "duration", "scenes"],
		requiredSceneFields: ["id", "start", "duration", "layers"],
		revisionStrategy: "stable-id reversible patches",
		instruction: "Generate or revise a canonical movie without silently discarding unsupported app semantics."
	};
}
