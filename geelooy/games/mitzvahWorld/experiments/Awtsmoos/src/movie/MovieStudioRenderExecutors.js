// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioRenderExecutors.js
 * @description Registers live and exact jobs with real phase progress, cancellation, delivery, and media executors.
 * The Awtsmoos renews preparation, frame, sample, package, and completion beyond percentages;
 * Awtsmoos.com maps those finite phases into one monotonic queue witness without hiding cancellation.
 */

import { renderExactMovieStudioSession } from './MovieExactRender.js';
import { serializeMovieRenderResult } from './MovieRenderResult.js';
import { registerMovieStudioMediaJobExecutors } from './MovieStudioMediaJobExecutors.js';

const VIDEO_START = 0.01;
const VIDEO_WEIGHT = 0.9;
const AUDIO_START = VIDEO_START + VIDEO_WEIGHT;
const AUDIO_WEIGHT = 0.08;

export function registerMovieStudioRenderExecutors(session, options = {}) {
	session.renderQueue.registerExecutor('live', async context => {
		const result = await session.recorder.render({
			download: context.request.download === true,
			onProgress: progress => context.onProgress(progress),
			signal: context.signal
		});
		return serializeMovieRenderResult(result);
	});
	session.renderQueue.registerExecutor('exact', context => exactRender(session, context));
	registerMovieStudioMediaJobExecutors(session, options.mediaJobs);
	return session.renderQueue;
}

export function movieExactQueueProgress(progress = {}) {
	const fraction = clamp(Number(progress.percent || 0) / 100);
	if (progress.stage === 'audio') return rounded(AUDIO_START + fraction * AUDIO_WEIGHT);
	if (progress.stage === 'package') return 0.99;
	return rounded(VIDEO_START + fraction * VIDEO_WEIGHT);
}

async function exactRender(session, context) {
	context.onProgress(VIDEO_START);
	const result = await renderExactMovieStudioSession(session, {
		...context.request.options,
		download: context.request.download === true,
		onComplete: () => context.onProgress(0.99),
		onProgress: progress => context.onProgress(movieExactQueueProgress(progress)),
		shouldAbort: () => context.signal.aborted,
		signal: context.signal
	});
	context.onProgress(1);
	return serializeMovieRenderResult(result);
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function rounded(value) {
	return Number(value.toFixed(6));
}
