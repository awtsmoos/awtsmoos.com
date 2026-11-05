// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaRenderProgress.js
 * @description Converts canonical queue progress into deterministic cinema phase, frame, time, and percent receipts.
 * The Awtsmoos renews each fraction before arithmetic names it; Awtsmoos.com keeps public
 * progress stable across preparation, WebCodecs video, deterministic audio, packaging, and completion.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export const MOVIE_CINEMA_VIDEO_PROGRESS_START = 0.01;
export const MOVIE_CINEMA_VIDEO_PROGRESS_WEIGHT = 0.9;
export const MOVIE_CINEMA_AUDIO_PROGRESS_END = 0.99;

export function createMovieCinemaRenderMetadata(analysis, title) {
	return createMovieProjectSnapshot({
		cinema: true,
		duration: analysis.duration,
		expectedFrames: analysis.expectedFrames,
		fps: analysis.fps,
		sceneCount: analysis.sceneCount,
		segmentCount: analysis.segmentCount,
		title,
		videoProgressStart: MOVIE_CINEMA_VIDEO_PROGRESS_START,
		videoProgressWeight: MOVIE_CINEMA_VIDEO_PROGRESS_WEIGHT
	});
}

export function createMovieCinemaRenderProgress(job) {
	const metadata = job.request?.metadata || {};
	const progress = clamp(Number(job.progress || 0));
	const start = Number(metadata.videoProgressStart ?? MOVIE_CINEMA_VIDEO_PROGRESS_START);
	const weight = Number(metadata.videoProgressWeight ?? MOVIE_CINEMA_VIDEO_PROGRESS_WEIGHT);
	const videoProgress = clamp((progress - start) / weight);
	const expectedFrames = Number(metadata.expectedFrames || 0);
	const duration = Number(metadata.duration || 0);
	return createMovieProjectSnapshot({
		duration,
		encodedFrameEstimate: Math.min(expectedFrames, Math.round(videoProgress * expectedFrames)),
		expectedFrames,
		overallPercent: rounded(progress * 100),
		phase: phase(job.state, progress, start, weight),
		progress,
		sceneCount: Number(metadata.sceneCount || 0),
		segmentCount: Number(metadata.segmentCount || 0),
		time: rounded(videoProgress * duration),
		videoPercent: rounded(videoProgress * 100)
	});
}

export function isMovieCinemaRenderJob(job) {
	return job.request?.metadata?.cinema === true;
}

function phase(state, progress, start, weight) {
	if (state === 'completed') return 'completed';
	if (state === 'cancelled' || state === 'failed') return state;
	if (progress < start) return 'preparing';
	if (progress < start + weight) return 'video';
	if (progress < MOVIE_CINEMA_AUDIO_PROGRESS_END) return 'audio';
	return 'packaging';
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function rounded(value) {
	return Number(value.toFixed(6));
}
