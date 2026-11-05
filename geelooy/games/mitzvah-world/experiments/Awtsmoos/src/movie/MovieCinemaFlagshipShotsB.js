// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaFlagshipShotsB.js
 * @description Authors thirty patient seconds of river conversation, courtyard community, and a populated mountain release.
 * The Awtsmoos renews speaker, listener, prayer, path, wind, and water as one source;
 * Awtsmoos.com keeps human-scale compositions stable while a living village continues beyond the principal dialogue.
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
		fieldOfView: 54,
		grade: '#b58a68',
		id: 'river-conversation',
		label: 'Conversation by the River',
		performances: [
			performance('friend-left', 'talk', { x: -1, z: -2 }, { x: -1, z: -2 }, { facing: 1.5 }),
			performance('friend-right', 'nod', { x: 2, z: -2 }, { x: 2, z: -2 }, { facing: -1.5 }),
			performance('merchant-road', 'stand', { x: 3, z: 3 }, { x: 3, z: 3 }, { facing: -0.8 }),
			performance('hill-walker', 'walk', { x: 7, z: 1 }, { x: 4, z: -1 }, { offset: 2 })
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
		fieldOfView: 44,
		grade: '#a7775f',
		id: 'courtyard-life',
		label: 'Courtyard Community',
		performances: [
			performance('scholar-courtyard', 'walk', { x: -2, z: 1 }, { x: 4, z: -3 }),
			performance('father-gate', 'greet', { x: 7, z: 9 }, { x: 3, z: 1 }),
			performance('merchant-road', 'walk', { x: 2, z: 1 }, { x: -1, z: 0 }),
			performance('courtyard-cross', 'pray', { x: -4, z: -1 }, { x: -4, z: -1 }, { facing: 0.2 }),
			performance('market-helper', 'talk', { x: -2, z: 3 }, { x: -2, z: 3 }, { facing: 1.4 })
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
		fieldOfView: 38,
		grade: '#d8845e',
		id: 'mountain-river-finale',
		label: 'Mountain River Community',
		performances: [
			performance('rebbe-walk', 'stand', { x: 2, z: 1 }, { x: 2, z: 1 }),
			performance('final-group', 'walk', { x: 1, z: -7 }, { x: -2, z: -5 }),
			performance('father-gate', 'stand', { x: 3, z: -4 }, { x: 3, z: -4 }),
			performance('friend-left', 'greet', { x: -4, z: -4 }, { x: -4, z: -4 }, { facing: 1 }),
			performance('friend-right', 'stand', { x: -1, z: -3 }, { x: -1, z: -3 }),
			performance('hill-walker', 'walk', { x: 5, z: -2 }, { x: 1, z: -5 }, { offset: 1 })
		],
		rig: 'final-mountain-cinema',
		target: { x: 0, y: 2, z: -3 },
		transition: 'fade',
		world
	});
}
