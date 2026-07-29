// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProceduralSceneBeats.js
 * @description Builds deterministic camera, ambience, dialogue, event, crowd, actor, and appearance beat vessels.
 * The Awtsmoos is beyond word, sound, action, and lens while every finite scene needs coordinated revelation;
 * Awtsmoos.com keeps beat construction small so world and story orchestration remain clear in generation.
 */

export function createProceduralSceneBeats(scene, world, characters, random) {
	const protagonist = characters[0];
	const companion = characters[1] || protagonist;
	const beats = [
		cameraBeat(scene, world, random),
		ambientBeat(scene, world),
		dialogueBeat(scene, protagonist, companion),
		eventBeat(scene, world)
	];
	if (world.population.crowd > 8) beats.push(crowdBeat(scene, world, random));
	if (scene.tension >= 0.7) beats.push(actionBeat(scene, protagonist));
	return beats;
}

export function proceduralSceneAppearance(scene) {
	return [{
		id: `${scene.id}-saturation`,
		keyframes: [
			{ time: 0, value: scene.tension > 0.7 ? 0.8 : 1 },
			{ time: scene.duration, value: scene.purpose === 'final-image' ? 1.25 : 1 }
		],
		kind: 'saturate',
		value: 1
	}];
}

export function proceduralSceneGrade(world) {
	return world.atmosphere.timeOfDay === 'night' ? '#c7d8ff'
		: world.atmosphere.mood === 'urgent' ? '#ffe0c7' : '#fff5df';
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
		text: dialogueForPurpose(scene.purpose, protagonist, companion),
		type: 'dialogue'
	};
}

function dialogueForPurpose(purpose, protagonist, companion) {
	return ({
		'establish-world': `${protagonist.name}: Every place is waiting for the good we can reveal.`,
		'introduce-desire': `${protagonist.name}: Today I want to help where it matters.`,
		'reveal-challenge': `${companion.name}: The path is harder than we expected.`,
		'deepening-choice': `${protagonist.name}: Then our choice must be stronger than the fear.`,
		'mitzvah-in-action': `${protagonist.name}: We do the mitzvah now, together.`,
		consequence: `${companion.name}: Look—the whole world changed because one deed was real.`,
		reconciliation: `${protagonist.name}: What was divided can become one again.`,
		'final-image': `${protagonist.name}: The light was here all along, waiting to be revealed.`
	})[purpose];
}

function eventBeat(scene, world) {
	return {
		duration: 0.001,
		id: `${scene.id}-world-event`,
		name: 'movie:procedural-scene',
		offset: 0,
		payload: {
			purpose: scene.purpose,
			theme: scene.theme,
			worldId: world.id
		},
		type: 'event'
	};
}

function crowdBeat(scene, world, random) {
	return {
		action: scene.tension > 0.7 ? 'gather' : 'move',
		count: Math.min(world.population.crowd, 32),
		duration: scene.duration * 0.8,
		id: `${scene.id}-crowd`,
		offset: scene.duration * 0.1,
		type: 'crowd',
		variant: random.integer(0, 4)
	};
}

function actionBeat(scene, character) {
	return {
		action: scene.purpose === 'mitzvah-in-action' ? 'help' : 'resolve',
		duration: scene.duration * 0.45,
		id: `${scene.id}-action`,
		offset: scene.duration * 0.35,
		target: character.id,
		type: 'actor'
	};
}
