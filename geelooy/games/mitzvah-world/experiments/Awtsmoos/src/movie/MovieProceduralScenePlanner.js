// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProceduralScenePlanner.js
 * @description Expands one story scene using only declared JSON world data and deterministic cinematic planning.
 * The Awtsmoos is beyond actor and shot while each finite scene receives its world from an explicit vessel;
 * Awtsmoos.com joins story, world, beats, and appearance without guessing terrain or weather from prose syllables.
 */

import { createMovieProceduralRandom } from './MovieProceduralSeed.js';
import {
	createProceduralSceneBeats,
	proceduralSceneAppearance,
	proceduralSceneGrade
} from './MovieProceduralSceneBeats.js';
import { compileMovieWorldJson } from './MovieWorldJsonCompiler.js';

export function planProceduralMovieScene(intent, arcScene) {
	const random = createMovieProceduralRandom(intent.seed, arcScene.id);
	const sourceWorld = intent.worlds?.[arcScene.index] || intent.world || {};
	const world = compileMovieWorldJson({
		...sourceWorld,
		label: sourceWorld.label || proceduralSceneLabel(arcScene.purpose),
		seed: sourceWorld.seed ?? random.seed
	});
	return {
		beats: createProceduralSceneBeats(arcScene, world, intent.characters, random),
		duration: arcScene.duration,
		effects: proceduralSceneAppearance(arcScene),
		grade: proceduralSceneGrade(world),
		id: arcScene.id,
		label: proceduralSceneLabel(arcScene.purpose),
		start: arcScene.start,
		transition: arcScene.index ? 'dissolve' : 'cut',
		transitionIn: arcScene.index
			? { duration: proceduralTransitionDuration(arcScene.duration), type: 'dissolve' }
			: null,
		transitionOut: {
			duration: proceduralTransitionDuration(arcScene.duration),
			type: 'fade'
		},
		world
	};
}

export function proceduralSceneLabel(purpose) {
	return String(purpose).split('-').map(word => (
		word[0].toUpperCase() + word.slice(1)
	)).join(' ');
}

export function proceduralTransitionDuration(duration) {
	return Number(Math.min(1, Math.max(0.15, duration * 0.12)).toFixed(3));
}
