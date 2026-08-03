// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaFlagshipShotsB.js
 * @description Authors the final thirty seconds through rooftops, forest parallax, human encounter, group crossing, sunset orbit, and mountain release.
 * The Awtsmoos renews near face and far summit without distance dividing the source; Awtsmoos.com
 * completes six more five-second vessels with intact Chossid motion and a widening final gaze.
 */

import {
	createMovieCinemaFlagshipScene as scene,
	movieCinemaPerformance as performance
} from './MovieCinemaFlagshipScene.js';

export function createMovieCinemaFlagshipShotsB(world) {
	return [
		scene({
			anchor: { x: 4, y: 0, z: -2 }, fieldOfView: 32, grade: '#caa66c',
			id: 'rooftop-rise', label: 'Rooftop Crane Rise', rig: 'rooftop-crane',
			target: { x: 0, y: 2, z: -4 }, world,
			performances: [performance('courtyard-cross', 'walk', { x: -4, z: -1 }, { x: 3, z: -4 })]
		}),
		scene({
			anchor: { x: 8, y: 0, z: -6 }, fieldOfView: 48, grade: '#5f8069',
			id: 'forest-parallax', label: 'Forest Edge Parallax', rig: 'orbitRight',
			target: { x: 5, y: 1.6, z: -8 }, world,
			performances: [performance('final-group', 'walk', { x: 5, z: -10 }, { x: 1, z: -7 })]
		}),
		scene({
			anchor: { x: 0, y: 0, z: -2 }, fieldOfView: 58, grade: '#b58a68',
			id: 'meeting-left', label: 'Meeting Over Shoulder', rig: 'shoulder-left-cinema',
			target: { x: 0.5, y: 1.7, z: -1 }, world,
			performances: [
				performance('friend-left', 'stand', { x: -1, z: -2 }, { x: -1, z: -2 }, { facing: 1.5 }),
				performance('friend-right', 'stand', { x: 2, z: -2 }, { x: 2, z: -2 }, { facing: -1.5 })
			]
		}),
		scene({
			anchor: { x: 1, y: 0, z: -2 }, fieldOfView: 62, grade: '#c99a72',
			id: 'meeting-reverse', label: 'Meeting Reverse Angle', rig: 'reverse-right-cinema',
			target: { x: 0, y: 1.7, z: -2 }, world,
			performances: [
				performance('friend-left', 'stand', { x: -1, z: -2 }, { x: -1, z: -2 }, { facing: 1.5 }),
				performance('friend-right', 'stand', { x: 2, z: -2 }, { x: 2, z: -2 }, { facing: -1.5 })
			]
		}),
		scene({
			anchor: { x: -5, y: 0, z: 0 }, fieldOfView: 45, grade: '#a7775f',
			id: 'group-crossing', label: 'Courtyard Group Crossing', rig: 'group-track-cinema',
			target: { x: 1, y: 1.6, z: -2 }, world,
			performances: [
				performance('scholar-courtyard', 'walk', { x: -2, z: 1 }, { x: 4, z: -3 }),
				performance('father-gate', 'walk', { x: 7, z: 9 }, { x: 3, z: 1 }),
				performance('merchant-road', 'walk', { x: 4, z: 5 }, { x: -1, z: 0 })
			]
		}),
		scene({
			anchor: { x: 0, y: 0, z: -5 }, fieldOfView: 36, grade: '#d8845e',
			id: 'mountain-finale', label: 'Sunset Mountain Pullback', rig: 'final-mountain-cinema',
			target: { x: 0, y: 2, z: -3 }, transition: 'fade', world,
			performances: [
				performance('rebbe-walk', 'stand', { x: 1, z: 2 }, { x: 1, z: 2 }),
				performance('final-group', 'stand', { x: 1, z: -7 }, { x: 1, z: -7 })
			]
		})
	];
}
