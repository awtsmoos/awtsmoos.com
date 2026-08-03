// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaFlagshipShotsA.js
 * @description Authors the first thirty seconds from mountain dawn through village courtyard and human-scale hero light.
 * The Awtsmoos renews horizon and footstep, cedar and doorway, wide revelation and close presence;
 * Awtsmoos.com arranges six five-second vessels without bending one human form.
 */

import {
	createMovieCinemaFlagshipScene as scene,
	movieCinemaPerformance as performance
} from './MovieCinemaFlagshipScene.js';

export function createMovieCinemaFlagshipShotsA(world) {
	return [
		scene({
			anchor: { x: 0, y: 0, z: 0 }, fieldOfView: 34, grade: '#a8c7d6',
			id: 'mountain-dawn', label: 'Mountain Dawn', rig: 'aerialPullback',
			target: { x: 0, y: 2, z: 0 }, transition: 'fade', world,
			performances: [performance('rebbe-walk', 'walk', { x: -10, z: 12 }, { x: -5, z: 7 })]
		}),
		scene({
			anchor: { x: -4, y: 0, z: 12 }, fieldOfView: 46, grade: '#90b976',
			id: 'grass-path', label: 'Grass Path', rig: 'dollyIn',
			target: { x: 0, y: 1.6, z: 3 }, world,
			performances: [performance('merchant-road', 'walk', { x: -4, z: 18 }, { x: -1, z: 9 })]
		}),
		scene({
			anchor: { x: -3, y: 0, z: 5 }, fieldOfView: 50, grade: '#789a73',
			id: 'cedar-track', label: 'Through the Cedars', rig: 'sideTrack',
			target: { x: 2, y: 1.7, z: 1 }, world,
			performances: [
				performance('rebbe-walk', 'walk', { x: -5, z: 7 }, { x: 1, z: 2 }),
				performance('merchant-road', 'walk', { x: -1, z: 9 }, { x: 4, z: 5 })
			]
		}),
		scene({
			anchor: { x: 6, y: 0, z: 8 }, fieldOfView: 38, grade: '#d3b27a',
			id: 'village-gate', label: 'Village Gate Reveal', rig: 'craneReveal',
			target: { x: 3, y: 2, z: 2 }, world,
			performances: [performance('father-gate', 'stand', { x: 7, z: 9 }, { x: 7, z: 9 })]
		}),
		scene({
			anchor: { x: 0, y: 0, z: 0 }, fieldOfView: 44, grade: '#d7c18b',
			id: 'courtyard-orbit', label: 'Courtyard Life', rig: 'orbitLeft',
			target: { x: 0, y: 1.7, z: 0 }, world,
			performances: [
				performance('scholar-courtyard', 'walk', { x: 3, z: 5 }, { x: -2, z: 1 }),
				performance('courtyard-cross', 'walk', { x: -12, z: 0 }, { x: -4, z: -1 })
			]
		}),
		scene({
			anchor: { x: -2, y: 0, z: 2 }, fieldOfView: 56, grade: '#c69362',
			id: 'human-hero', label: 'Human Hero Low Angle', rig: 'hero-low-cinema',
			target: { x: -1, y: 1.8, z: 0 }, world,
			performances: [performance('rebbe-walk', 'stand', { x: 1, z: 2 }, { x: 1, z: 2 })]
		})
	];
}
