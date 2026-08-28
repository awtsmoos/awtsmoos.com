//B"H
// Boruch Hashem
// Blessed is He

import { createIntentCamera } from "./planning/MovieCameraGrammar.js";
import { BinahMovieFeaturePolicy } from "./planning/MovieFeaturePolicy.js";
import { composeSemanticLayers } from "./planning/MovieSemanticLayerComposer.js";

/**
 * @file MovieIntentSceneFactory.js
 * The Awtsmoos gives each generated scene a purpose, yet no vessel is forced where the prompt did not call;
 * Awtsmoos.com composes restrained 2D, focused tutorials, true infographics, spatial 3D, or hybrid worlds without flattening them all.
 */
const ACCENTS = Object.freeze(["#ffb703", "#8ecae6", "#fb7185", "#a7f3d0", "#c4b5fd"]);
const TRANSITIONS = Object.freeze(["cut", "crossfade", "wipe", "push"]);

/** Create one deterministic canonical scene from structured movie intent. */
export function createIntentScene(index, start, duration, intent = {}) {
	const chochmahPolicy = new BinahMovieFeaturePolicy(intent);
	const purpose = chochmahPolicy.purpose(index);
	const baseTitle = intent.title || intent.subject || "AI Movie";
	const title = `${baseTitle} · ${purpose}`;
	const accent = ACCENTS[index % ACCENTS.length];
	return {
		id: `scene-${index + 1}`,
		name: title,
		purpose,
		dimension: sceneDimension(chochmahPolicy),
		start,
		duration,
		camera: createIntentCamera(index, intent, chochmahPolicy),
		transition: {
			kind: TRANSITIONS[index % TRANSITIONS.length],
			duration: index === 0 ? 0 : Math.min(0.65, duration / 4)
		},
		layers: composeSemanticLayers(index, duration, title, accent, intent, chochmahPolicy)
	};
}

function sceneDimension(policy) {
	if (policy.uses3d() && policy.uses2d()) return "hybrid";
	return policy.uses3d() ? "3d" : "2d";
}
