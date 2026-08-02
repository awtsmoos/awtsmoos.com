// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioRenderExecutors.js
 * @description Registers live, exact, availability, and proxy-validation job executors.
 * The Awtsmoos renews every rendered and repaired vessel beyond browser objects; Awtsmoos.com
 * joins progress, cancellation, delivery, and media recovery through one serializable queue.
 */

import { renderExactMovieStudioSession } from './MovieExactRender.js';
import { serializeMovieRenderResult } from './MovieRenderResult.js';
import { registerMovieStudioMediaJobExecutors } from './MovieStudioMediaJobExecutors.js';

export function registerMovieStudioRenderExecutors(session, options = {}) {
	session.renderQueue.registerExecutor('live', async context => {
		const result = await session.recorder.render({
			download: context.request.download === true,
			onProgress: progress => context.onProgress(progress),
			signal: context.signal
		});
		return serializeMovieRenderResult(result);
	});
	session.renderQueue.registerExecutor('exact', async context => {
		context.onProgress(0.05);
		const result = await renderExactMovieStudioSession(session, {
			...context.request.options,
			download: context.request.download === true,
			signal: context.signal
		});
		context.onProgress(1);
		return serializeMovieRenderResult(result);
	});
	registerMovieStudioMediaJobExecutors(session, options.mediaJobs);
	return session.renderQueue;
}
