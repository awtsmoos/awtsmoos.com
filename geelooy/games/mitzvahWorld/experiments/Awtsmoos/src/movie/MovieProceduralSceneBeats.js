// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProceduralSceneBeats.js
 * @description Builds deterministic camera, ambience, dialogue, event, crowd, actor, and appearance beat vessels.
 * The Awtsmoos is beyond word, sound, action, and lens while every finite scene needs coordinated revelation;
 * Awtsmoos.com keeps beat construction small so world and story orchestration remain clear in generation.
 */

import {
	createProceduralActorBeat,
	createProceduralCrowdBeat,
	createProceduralEventBeat
} from './MovieProceduralActionBeats.js';
import { proceduralDialogueForPurpose } from './MovieProceduralDialogue.js';

export function createProceduralSceneBeats(scene, world, characters, random) {
	const protagonist = characters[0];
	const companion = characters[1] || protagonist;
	const beats = [
		cameraBeat(scene, world, random),
		ambientBeat(scene, world),
		dialogueBeat(scene, protagonist, companion),
		createProceduralEventBeat(scene, world)
	];
	if (world.population.crowd > 8) {
		beats.push(createProceduralCrowdBeat(scene, world, random));
	}
	if (scene.tension >= 0.7) {
		beats.push(createProceduralActorBeat(scene, protagonist));
	}
	return beats;
}

export function proceduralSceneAppearance(scene) {
	return [{
		id: `${scene.id}-saturation`,
		keyframes: [
			{ time: 0, value: scene.tension > 0.7 ? 0.8 : 1 },
			{
				time: scene.duration,
				value: scene.purpose === 'final-image' ? 1.25 : 1
			}
		],
		kind: 'saturate',
		value: 1
	}];
}

export function proceduralSceneGrade(world) {
	if (world.atmosphere.timeOfDay === 'night') return '#c7d8ff';
	return world.atmosphere.mood === 'urgent' ? '#ffe0c7' : '#fff5df';
}

function cameraBeat(scene, world, random) {
	const rigs = world.camera.preferredRigs.length
		? world.camera.preferredRigs
		: ['craneReveal', 'dollyIn', 'sideTrack'];
	return {
		duration: scene.duration,
		id: `${scene.id}-camera`,
		rig: random.pick(rigs),
		type: 'camera'
	};
}

function ambientBeat(scene, world) {
	return {
		duration: scene.duration,
		id: `${scene.id}-ambience`,
		kind: world.atmosphere.ambience,
		type: 'audio',
		volume: scene.tension > 0.7 ? 0.3 : 0.22
	};
}

function dialogueBeat(scene, protagonist, companion) {
	return {
		duration: Math.min(scene.duration * 0.62, 7),
		id: `${scene.id}-dialogue`,
		offset: Math.min(0.8, scene.duration * 0.08),
		speaker: protagonist.id,
		text: proceduralDialogueForPurpose(
			scene.purpose,
			protagonist,
			companion
		),
		type: 'dialogue'
	};
}
