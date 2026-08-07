// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaFlagshipShotsB.js
 * @description Authors thirty measured seconds of river conversation, courtyard life, and a quiet mountain release.
 * The Awtsmoos renews speaker and listener, path and water, gathering and horizon as one source;
 * Awtsmoos.com favors sustained human-scale views over restless reverse angles while dialogue remains native.
 */

import {
	createMovieCinemaFlagshipScene as scene,
	movieCinemaAmbience as ambience,
	movieCinemaDialogue as dialogue,
	movieCinemaPerformance as performance
} from './MovieCinemaFlagshipScene.js';

export function createMovieCinemaFlagshipShotsB(world) {
	return [riverConversation(world), courtyardLife(world), mountainFinale(world)];
}

function riverConversation(world) {
	return scene({
		anchor: { x: 0, y: 0, z: -2 },
		beats: [
			ambience('water', { frequency: 72, volume: 0.02 }),
			dialogue('Friend by the river', 'The river is full after the rain.', { duration: 3, offset: 1 }),
			dialogue('His companion', 'Boruch Hashem. The village needed that water.', { duration: 4, offset: 5 })
		],
		duration: 10,
		fieldOfView: 58,
		grade: '#b58a68',
		id: 'river-conversation',
		label: 'Conversation by the River',
		performances: [
			performance('friend-left', 'stand', { x: -1, z: -2 }, { x: -1, z: -2 }, { facing: 1.5 }),
			performance('friend-right', 'stand', { x: 2, z: -2 }, { x: 2, z: -2 }, { facing: -1.5 })
		],
		rig: 'shoulder-left-cinema',
		target: { x: 0.5, y: 1.7, z: -1 },
		world
	});
}

function courtyardLife(world) {
	return scene({
		anchor: { x: -5, y: 0, z: 0 },
		beats: [
			ambience('wind', { volume: 0.018 }),
			dialogue('Father at the gate', 'Good morning. Walk with us to the courtyard.', { duration: 4, offset: 2 })
		],
		duration: 10,
		fieldOfView: 45,
		grade: '#a7775f',
		id: 'courtyard-life',
		label: 'Courtyard Life',
		performances: [
			performance('scholar-courtyard', 'walk', { x: -2, z: 1 }, { x: 4, z: -3 }),
			performance('father-gate', 'walk', { x: 7, z: 9 }, { x: 3, z: 1 }),
			performance('merchant-road', 'walk', { x: 2, z: 1 }, { x: -1, z: 0 })
		],
		rig: 'group-track-cinema',
		target: { x: 1, y: 1.6, z: -2 },
		world
	});
}

function mountainFinale(world) {
	return scene({
		anchor: { x: 0, y: 0, z: -5 },
		beats: [
			ambience('wind', { volume: 0.028 }),
			ambience('water', { frequency: 68, volume: 0.014 })
		],
		duration: 10,
		fieldOfView: 36,
		grade: '#d8845e',
		id: 'mountain-river-finale',
		label: 'Mountain River Pullback',
		performances: [
			performance('rebbe-walk', 'stand', { x: 2, z: 1 }, { x: 2, z: 1 }),
			performance('final-group', 'walk', { x: 1, z: -7 }, { x: -2, z: -5 })
		],
		rig: 'final-mountain-cinema',
		target: { x: 0, y: 2, z: -3 },
		transition: 'fade',
		world
	});
}
