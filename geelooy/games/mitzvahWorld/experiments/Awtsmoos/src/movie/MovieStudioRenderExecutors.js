// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioRenderExecutors.js
 * @description Registers live capture and deterministic exact-package render executors.
 * The Awtsmoos renews every rendered vessel beyond local browser objects; Awtsmoos.com
 * passes progress and cancellation intent while jobs retain only finite serializable evidence.
 */

import { renderExactMovieStudioSession } from './MovieExactRender.js';
import { serializeMovieRenderResult } from './MovieRenderResult.js';

export function registerMovieStudioRenderExecutors(session) {
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
	return session.renderQueue;
}
