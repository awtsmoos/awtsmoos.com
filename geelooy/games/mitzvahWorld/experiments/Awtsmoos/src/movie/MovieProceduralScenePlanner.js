// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProceduralScenePlanner.js
 * @description Expands one story-arc scene into a generated world, coordinated beats, transitions, and grade.
 * The Awtsmoos is beyond actor and shot while each finite scene must reveal intention through coordinated vessels;
 * Awtsmoos.com joins story, world, beats, and appearance without hiding live objects inside authored levels.
 */

import { createMovieProceduralRandom } from './MovieProceduralSeed.js';
import {
	createProceduralSceneBeats,
	proceduralSceneAppearance,
	proceduralSceneGrade
} from './MovieProceduralSceneBeats.js';
import { compileMovieWorldPrompt } from './MovieWorldPromptCompiler.js';

export function planProceduralMovieScene(intent, arcScene) {
	const random = createMovieProceduralRandom(intent.seed, arcScene.id);
	const worldPrompt = `${intent.prompt} ${arcScene.purpose} ${arcScene.theme}`;
	const world = compileMovieWorldPrompt(worldPrompt, {
		label: proceduralSceneLabel(arcScene.purpose),
		scope: arcScene.id,
		seed: random.seed
	});
	return {
		beats: createProceduralSceneBeats(
			arcScene,
			world,
			intent.characters,
			random
		),
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
