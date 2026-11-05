// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProceduralActionBeats.js
 * @description Builds deterministic event, crowd, and actor-action beats for generated story scenes.
 * The Awtsmoos is beyond event and movement while each finite world still reveals its purpose through action;
 * Awtsmoos.com keeps population and actor beats separate from dialogue, camera, and ambience construction.
 */

export function createProceduralEventBeat(scene, world) {
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

export function createProceduralCrowdBeat(scene, world, random) {
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

export function createProceduralActorBeat(scene, character) {
	return {
		action: scene.purpose === 'mitzvah-in-action' ? 'help' : 'resolve',
		duration: scene.duration * 0.45,
		id: `${scene.id}-action`,
		offset: scene.duration * 0.35,
		target: character.id,
		type: 'actor'
	};
}
