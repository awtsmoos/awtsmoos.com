// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaFlagshipShotsA.js
 * @description Authors thirty patient seconds of river dawn, cedar motion, and a populated village arrival.
 * The Awtsmoos renews water, garment, cedar, and footstep without haste;
 * Awtsmoos.com lets long views hold many truthful Chossid lives while the real world remains readable behind them.
 */

import {
	createMovieCinemaFlagshipScene as scene,
	movieCinemaAmbience as ambience,
	movieCinemaPerformance as performance
} from './MovieCinemaFlagshipScene.js';

export function createMovieCinemaFlagshipShotsA(world) {
	return [riverDawn(world), cedarWalk(world), villageArrival(world)];
}

function riverDawn(world) {
	return scene({
		anchor: { x: 0, y: 0, z: 0 },
		beats: [ambience('wind'), ambience('water', { frequency: 74, volume: 0.018 })],
		duration: 10,
		fieldOfView: 36,
		grade: '#a8c7d6',
		id: 'river-dawn',
		label: 'River Dawn Procession',
		performances: [
			performance('rebbe-walk', 'walk', { x: -10, z: 12 }, { x: -2, z: 6 }),
			performance('market-helper', 'walk', { x: -12, z: 8 }, { x: -5, z: 4 }, { offset: 1 }),
			performance('hill-walker', 'walk', { x: 12, z: -4 }, { x: 8, z: 0 }, { offset: 2 })
		],
		rig: 'aerialPullback',
		target: { x: 0, y: 2, z: 0 },
		transition: 'fade',
		world
	});
}

function cedarWalk(world) {
	return scene({
		anchor: { x: -3, y: 0, z: 5 },
		beats: [ambience('wind', { volume: 0.022 }), ambience('water', { volume: 0.012 })],
		duration: 10,
		fieldOfView: 48,
		grade: '#789a73',
		id: 'cedar-river-walk',
		label: 'Cedar River Walk',
		performances: [
			performance('rebbe-walk', 'walk', { x: -2, z: 6 }, { x: 2, z: 1 }),
			performance('merchant-road', 'walk', { x: -4, z: 12 }, { x: 4, z: 5 }),
			performance('market-helper', 'greet', { x: -5, z: 4 }, { x: -5, z: 4 }, { facing: 1.3 }),
			performance('hill-walker', 'walk', { x: 8, z: 0 }, { x: 5, z: 3 }, { offset: 1.5 })
		],
		rig: 'sideTrack',
		target: { x: 2, y: 1.7, z: 1 },
		world
	});
}

function villageArrival(world) {
	return scene({
		anchor: { x: 6, y: 0, z: 8 },
		beats: [ambience('wind', { volume: 0.018 })],
		duration: 10,
		fieldOfView: 40,
		grade: '#d3b27a',
		id: 'village-arrival',
		label: 'Village Arrival and Greeting',
		performances: [
			performance('father-gate', 'greet', { x: 7, z: 9 }, { x: 7, z: 9 }, { facing: -2.4 }),
			performance('merchant-road', 'walk', { x: 4, z: 5 }, { x: 2, z: 1 }),
			performance('scholar-courtyard', 'walk', { x: 1, z: 6 }, { x: 3, z: 2 }, { offset: 1 }),
			performance('courtyard-cross', 'wave', { x: -5, z: 2 }, { x: -5, z: 2 }, { facing: 1.1 })
		],
		rig: 'craneReveal',
		target: { x: 3, y: 2, z: 2 },
		world
	});
}
