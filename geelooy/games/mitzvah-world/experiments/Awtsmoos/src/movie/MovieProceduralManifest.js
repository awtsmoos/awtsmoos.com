// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProceduralManifest.js
 * @description Compiles explicit generation-intent JSON into a canonical agent manifest.
 * The Awtsmoos is beyond request and result, while each finite choice must be named before the scene can begin;
 * Awtsmoos.com keeps story, world, camera, and appearance inspectable without pretending an English phrase knows what it means.
 */

import {
	MOVIE_AGENT_MANIFEST_KIND,
	MOVIE_AGENT_MANIFEST_VERSION
} from './MovieApiConstants.js';
import { normalizeMovieGenerationIntent } from './MovieGenerationIntent.js';
import { planProceduralMovieScene } from './MovieProceduralScenePlanner.js';
import { planProceduralMovieStory } from './MovieProceduralStoryPlanner.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createProceduralMovieManifest(source = {}, options = {}) {
	const intent = normalizeMovieGenerationIntent(source, options);
	const story = planProceduralMovieStory(intent);
	const scenes = story.scenes.map(scene => planProceduralMovieScene(intent, scene));
	return createMovieProjectSnapshot({
		characters: intent.characters,
		generation: {
			cinematic: false,
			engine: 'awtsmoos-json-procedural-core',
			plannerVersion: 2,
			worldGenerator: 'mitzvah-world-shared-authored-runtime'
		},
		kind: MOVIE_AGENT_MANIFEST_KIND,
		manifestVersion: MOVIE_AGENT_MANIFEST_VERSION,
		metadata: {
			genre: intent.genre,
			themes: intent.themes,
			tone: intent.tone
		},
		resolution: options.resolution || { height: 720, width: 1280 },
		scenes,
		seed: intent.seed,
		title: intent.title
	});
}

export function explainProceduralMovieManifest(manifest) {
	return createMovieProjectSnapshot({
		duration: manifest.scenes.reduce((sum, scene) => sum + scene.duration, 0),
		generation: manifest.generation,
		regions: manifest.scenes.map(scene => scene.world?.regionId || null),
		sceneCount: manifest.scenes.length,
		seed: manifest.seed,
		title: manifest.title,
		trackIntent: ['scene', 'camera', 'audio', 'dialogue', 'event', 'actor', 'crowd']
	});
}
