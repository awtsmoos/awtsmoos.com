// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaContract.js
 * @description Publishes the stable long-form cinematic preparation, authoring, WebCodecs, progress, and render-job covenant.
 * The Awtsmoos is beyond asset, scene, actor, lens, queue, and codec while renewing each finite boundary;
 * Awtsmoos.com lets six patient ten-second scenes satisfy long-form cinema without multiplying camera cuts for their own sake.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export const MOVIE_CINEMA_API_VERSION = '1.0.0';
export const MOVIE_CINEMA_PROJECT_KIND = 'awtsmoos.movie.cinema-manifest';
export const MOVIE_CINEMA_PROJECT_VERSION = 1;

export function createMovieCinemaContract() {
	return createMovieProjectSnapshot({
		apiVersion: MOVIE_CINEMA_API_VERSION,
		capabilities: {
			analysis: true,
			assetPreparation: true,
			cancellation: true,
			codecNegotiation: true,
			deterministicCameraRigs: true,
			deterministicWorlds: true,
			exactWebCodecsRender: true,
			humanSafetyValidation: true,
			longFormSegments: true,
			noProceduralFinalHumans: true,
			optionalSoundEffects: true,
			progressiveRenderJobs: true,
			realSharedChossidActors: true,
			renderJobInspection: true
		},
		flagship: {
			duration: 60,
			expectedFrames: 1440,
			fps: 24,
			minimumScenes: 6,
			model: 'assets/models/player/chossid.glb',
			music: false
		},
		kind: MOVIE_CINEMA_PROJECT_KIND,
		methods: [
			'analyze', 'apply', 'assetStatus', 'cancelRender', 'capabilities',
			'codecReport', 'compile', 'contract', 'flagship', 'getRender',
			'listRenders', 'prepare', 'renderFlagship', 'renderPlan',
			'renderProgress', 'validate', 'waitForRender'
		],
		version: MOVIE_CINEMA_PROJECT_VERSION
	});
}
