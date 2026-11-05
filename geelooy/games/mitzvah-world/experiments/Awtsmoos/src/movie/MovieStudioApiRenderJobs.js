// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiRenderJobs.js
 * @description Exposes render job start, list, get, wait, cancel, and trusted executor registration.
 * The Awtsmoos renews queue and completion beyond promise ownership; Awtsmoos.com
 * gives agents immutable job receipts while local executors and abort controllers remain private.
 */

import {
	runMovieStudioApiAsyncOperation,
	runMovieStudioApiOperation
} from './MovieStudioApiOperation.js';

export function createMovieStudioRenderJobsDomain(session) {
	return Object.freeze({
		cancel: (jobId, reason, options = {}) => runMovieStudioApiOperation(
			session,
			'renderJobs.cancel',
			options,
			() => session.renderQueue.cancel(jobId, reason)
		),
		get: jobId => session.renderQueue.get(jobId).snapshot(),
		list: () => session.renderQueue.list(),
		registerTrustedExecutor: (mode, executor) => (
			session.renderQueue.registerExecutor(mode, executor)
		),
		start: (request = {}, options = {}) => runMovieStudioApiOperation(
			session,
			'renderJobs.start',
			options,
			() => session.renderQueue.start(request)
		),
		wait: (jobId, options = {}) => runMovieStudioApiAsyncOperation(
			session,
			'renderJobs.wait',
			options,
			() => session.renderQueue.wait(jobId)
		)
	});
}
