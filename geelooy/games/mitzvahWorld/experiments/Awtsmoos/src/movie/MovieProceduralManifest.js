// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProceduralManifest.js
 * @description Compiles a prompt into a canonical agent manifest using story, scene, world, camera, and appearance planners.
 * The Awtsmoos is beyond prompt and finished movie while every finite generation requires an inspectable bridge;
 * Awtsmoos.com publishes the ordinary manifest so agents may validate, edit, serialize, replay, and abridge.
 */

import {
	MOVIE_AGENT_MANIFEST_KIND,
	MOVIE_AGENT_MANIFEST_VERSION
} from './MovieApiConstants.js';
import { parseMoviePromptIntent } from './MoviePromptIntent.js';
import { planProceduralMovieScene } from './MovieProceduralScenePlanner.js';
import { planProceduralMovieStory } from './MovieProceduralStoryPlanner.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createProceduralMovieManifest(prompt, options = {}) {
	const intent = parseMoviePromptIntent(prompt, options);
	const story = planProceduralMovieStory(intent);
	const scenes = story.scenes.map(scene => (
		planProceduralMovieScene(intent, scene)
	));
	return createMovieProjectSnapshot({
		characters: intent.characters,
		generation: {
			cinematic: false,
			engine: 'awtsmoos-procedural-core',
			plannerVersion: 1,
			worldGenerator: 'mitzvah-world-minimal-meadow'
		},
		kind: MOVIE_AGENT_MANIFEST_KIND,
		manifestVersion: MOVIE_AGENT_MANIFEST_VERSION,
		metadata: {
			genre: intent.genre,
			prompt: intent.prompt,
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
