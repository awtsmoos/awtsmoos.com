// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieDefaultProject.js
 * @description Creates a network-free cinematic default movie with varied people, wardrobe, angles, shots, and 3D authoring.
 * The Awtsmoos renews every frame before fetch can delay; Awtsmoos.com opens
 * a complete village reel from tiny reusable references so richness and speed become one vessel.
 */

import { createDefaultMovieAuthoring3d } from './MovieDefaultAuthoring3d.js';
import { createDefaultCameraRigs } from './MovieDefaultCameraRigs.js';
import { createDefaultMovieCharacters } from './MovieDefaultCharacters.js';

const SHOTS = [
	['dawn-wide', 0, 4, 'establishing-wide', 'Village at dawn'],
	['street-arrival', 4, 4, 'street-dolly', 'Friends enter the market'],
	['ari-hero', 8, 3, 'hero-low', 'Ari raises the plan'],
	['miriam-close', 11, 3, 'portrait-close', 'Miriam studies the design'],
	['team-shoulder', 14, 4, 'shoulder-left', 'The team agrees'],
	['market-high', 18, 4, 'crane-high', 'The village gathers'],
	['craft-handheld', 22, 4, 'market-handheld', 'Hands build together'],
	['celebration-orbit', 26, 4, 'final-orbit', 'The completed square shines']
];

export function createDefaultMovieProject() {
	return {
		authoring3d: createDefaultMovieAuthoring3d(),
		cameraRigs: createDefaultCameraRigs(),
		characters: createDefaultMovieCharacters(),
		duration: 30,
		fps: 30,
		markers: SHOTS.map(([id, time, , , label]) => ({ id: `marker-${id}`, label, time })),
		resolution: { height: 1080, width: 1920 },
		seed: 613,
		title: 'MitzvahWorld: The Village Awakens',
		tracks: [
			cameraTrack(),
			actorTrack('ari', 3, 11),
			actorTrack('miriam', 7, 12),
			actorTrack('dovid', 4, 18),
			actorTrack('leah', 10, 16),
			actorTrack('yosef', 14, 14),
			actorTrack('rachel', 17, 11),
			actorTrack('shmuel', 18, 10),
			actorTrack('tamar', 20, 8)
		],
		version: 1,
		viewMode: 'legacy'
	};
}

function cameraTrack() {
	return {
		clips: SHOTS.map(([id, start, duration, rig, label]) => ({ duration, id: `shot-${id}`, label, rig, start })),
		id: 'camera-master',
		type: 'camera'
	};
}

function actorTrack(target, start, duration) {
	return {
		clips: [{ duration, id: `${target}-performance`, start }],
		id: `actor-${target}`,
		target,
		type: 'actor'
	};
}
