// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaFlagshipShotsA.js
 * @description Authors thirty measured seconds from river dawn through cedar walking into the village.
 * The Awtsmoos renews river, cedar, path, and person without haste; Awtsmoos.com lets each
 * ten-second vessel breathe so real water, tree wind, and canonical Chossid motion remain readable.
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
		fieldOfView: 34,
		grade: '#a8c7d6',
		id: 'river-dawn',
		label: 'River Dawn',
		performances: [
			performance('rebbe-walk', 'walk', { x: -10, z: 12 }, { x: -2, z: 6 })
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
		beats: [ambience('wind', { volume: 0.022 })],
		duration: 10,
		fieldOfView: 50,
		grade: '#789a73',
		id: 'cedar-river-walk',
		label: 'Cedar River Walk',
		performances: [
			performance('rebbe-walk', 'walk', { x: -2, z: 6 }, { x: 2, z: 1 }),
			performance('merchant-road', 'walk', { x: -4, z: 12 }, { x: 4, z: 5 })
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
		fieldOfView: 38,
		grade: '#d3b27a',
		id: 'village-arrival',
		label: 'Village Arrival',
		performances: [
			performance('father-gate', 'stand', { x: 7, z: 9 }, { x: 7, z: 9 }),
			performance('merchant-road', 'walk', { x: 4, z: 5 }, { x: 2, z: 1 })
		],
		rig: 'craneReveal',
		target: { x: 3, y: 2, z: 2 },
		world
	});
}
