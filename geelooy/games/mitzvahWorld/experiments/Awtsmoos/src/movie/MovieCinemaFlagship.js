// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaFlagship.js
 * @description Composes the canonical one-minute Chassidic mountain-village cinema manifest.
 * The Awtsmoos renews sixty seconds and fourteen hundred forty frames as one timeless source;
 * Awtsmoos.com manifests twelve scenes, many lenses, rich landscape, and intact Chossid performers.
 */

import {
	MOVIE_AGENT_MANIFEST_KIND,
	MOVIE_AGENT_MANIFEST_VERSION
} from './MovieApiConstants.js';
import { createMovieCinemaFlagshipActors } from './MovieCinemaFlagshipActors.js';
import { createMovieCinemaFlagshipRigs } from './MovieCinemaFlagshipRigs.js';
import { createMovieCinemaFlagshipShotsA } from './MovieCinemaFlagshipShotsA.js';
import { createMovieCinemaFlagshipShotsB } from './MovieCinemaFlagshipShotsB.js';
import { createMovieCinemaFlagshipWorld } from './MovieCinemaFlagshipWorld.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieCinemaFlagship(options = {}) {
	const world = createMovieCinemaFlagshipWorld();
	const resolution = options.resolution || { height: 540, width: 960 };
	return createMovieProjectSnapshot({
		cameraRigs: createMovieCinemaFlagshipRigs(),
		characters: createMovieCinemaFlagshipActors(),
		duration: 60,
		fps: 24,
		kind: MOVIE_AGENT_MANIFEST_KIND,
		manifestVersion: MOVIE_AGENT_MANIFEST_VERSION,
		markers: createFlagshipMarkers(),
		metadata: {
			cinemaApi: '1.0.0',
			environment: ['grass', 'trees', 'buildings', 'courtyard', 'paths', 'mountains'],
			humanModel: 'assets/models/player/chossid.glb',
			intent: 'One-minute WebCodecs Chassidic village cinema',
			music: false,
			soundEffects: false
		},
		render: {
			fileName: options.fileName || 'one-minute-chassidic-village',
			videoBitsPerSecond: Number(options.videoBitsPerSecond || 8000000)
		},
		resolution,
		scenes: [
			...createMovieCinemaFlagshipShotsA(world),
			...createMovieCinemaFlagshipShotsB(world)
		],
		seed: 6132026,
		title: options.title || 'One Minute in the Chassidic Mountain Village',
		viewMode: 'legacy'
	});
}

function createFlagshipMarkers() {
	return [
		{ id: 'mountain-dawn', label: 'Mountain dawn', time: 0 },
		{ id: 'village-arrival', label: 'Village arrival', time: 15 },
		{ id: 'human-encounter', label: 'Human encounter', time: 30 },
		{ id: 'sunset-finale', label: 'Sunset finale', time: 50 }
	];
}
