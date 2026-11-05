// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiCinemaRender.js
 * @description Adds prepared long-form render lifecycle while requiring the complete live cinema world before frame zero.
 * The Awtsmoos renews home, river, ridge, actor, asset, queue, and encoded completion beyond scalar measurement;
 * Awtsmoos.com waits for strict mounted-world truth so final cinema never begins inside a gameplay degradation window.
 */

import {
	createMovieCinemaRenderMetadata,
	createMovieCinemaRenderProgress,
	isMovieCinemaRenderJob
} from './MovieCinemaRenderProgress.js';
import {
	runMovieStudioApiAsyncOperation,
	runMovieStudioApiOperation
} from './MovieStudioApiOperation.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { waitForMovieWorldRealism } from './MovieWorldRealismWait.js';

export function createMovieStudioCinemaRenderDomain(session, prepareFlagship) {
	return {
		cancelRender: (jobId, reason, options = {}) => runMovieStudioApiOperation(
			session,
			'cinema.cancelRender',
			options,
			() => enrichCancellation(session.renderQueue.cancel(jobId, reason))
		),
		getRender: jobId => enrichCinemaJob(session.renderQueue.get(jobId).snapshot()),
		listRenders: () => createMovieProjectSnapshot(
			session.renderQueue.list().filter(isMovieCinemaRenderJob).map(enrichCinemaJob)
		),
		renderFlagship: (options = {}) => runMovieStudioApiAsyncOperation(
			session,
			'cinema.renderFlagship',
			options,
			async () => {
				const installed = await prepareFlagship(options);
				const world = await waitForMovieWorldRealism(session, options);
				return startFlagship(session, installed, options, world);
			}
		),
		renderProgress: jobId => createMovieCinemaRenderProgress(
			session.renderQueue.get(jobId).snapshot()
		),
		waitForRender: (jobId, options = {}) => runMovieStudioApiAsyncOperation(
			session,
			'cinema.waitForRender',
			options,
			async () => enrichCinemaJob(await session.renderQueue.wait(jobId))
		)
	};
}

function startFlagship(session, installed, options, world) {
	const request = {
		download: options.download === true,
		metadata: createMovieCinemaRenderMetadata(installed.analysis, installed.project.title),
		mode: 'exact',
		options: {
			fileName: options.fileName || 'one-minute-chassidic-village',
			segmentDuration: Number(options.segmentDuration || 15)
		}
	};
	return createMovieProjectSnapshot({
		analysis: installed.analysis,
		assets: installed.assets,
		job: enrichCinemaJob(session.renderQueue.start(request)),
		projectRevision: session.revision,
		world
	});
}

function enrichCancellation(result) {
	return createMovieProjectSnapshot({
		cancelled: result.cancelled,
		job: enrichCinemaJob(result.job)
	});
}

function enrichCinemaJob(job) {
	return createMovieProjectSnapshot({
		...job,
		cinemaProgress: createMovieCinemaRenderProgress(job)
	});
}
