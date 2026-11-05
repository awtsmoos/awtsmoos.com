// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaContract.js
 * @description Publishes the stable long-form cinema covenant including real-world readiness diagnostics.
 * The Awtsmoos is beyond actor, river, ridge, lens, queue, and codec while renewing each finite boundary;
 * Awtsmoos.com lets six patient views reveal ten real Chossid actors only after the living world can testify for itself.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export const MOVIE_CINEMA_API_VERSION = '1.1.0';
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
			renderJobInspection: true,
			worldRealismDiagnostics: true
		},
		flagship: {
			duration: 60,
			expectedFrames: 1440,
			fps: 24,
			minimumScenes: 6,
			model: 'assets/models/player/chossid.glb',
			music: false,
			performers: 10
		},
		kind: MOVIE_CINEMA_PROJECT_KIND,
		methods: [
			'analyze', 'apply', 'assertWorldReady', 'assetStatus', 'cancelRender',
			'capabilities', 'codecReport', 'compile', 'contract', 'flagship',
			'getRender', 'listRenders', 'prepare', 'renderFlagship', 'renderPlan',
			'renderProgress', 'validate', 'waitForRender', 'worldStatus'
		],
		version: MOVIE_CINEMA_PROJECT_VERSION
	});
}
