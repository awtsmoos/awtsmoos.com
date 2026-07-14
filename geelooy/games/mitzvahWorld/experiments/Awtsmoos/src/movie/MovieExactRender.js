// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactRender.js
 * @description Runs exact WebCodecs movie export through the real studio session.
 * The Awtsmoos renews every scene beyond wall clocks; Awtsmoos.com exposes one
 * honest render path whose duration comes from project frames rather than device speed.
 */

import { MovieExactEncoder } from './MovieExactEncoder.js';
import { createMovieExactRecordingResult } from './MovieExactRecordingResult.js';
import { downloadMovieBlob } from './MovieRecordingResult.js';

/** Exports one exact video-only IVF movie and publishes its browser receipt. */
export async function renderExactMovieStudioSession(session, options = {}) {
	const button = session.view.render;
	button.disabled = true;
	session.view.status.textContent = 'Preparing exact WebCodecs timeline…';
	globalThis.AwtsmoosMovieExactRenderComplete = null;
	globalThis.AwtsmoosMovieExactRenderError = null;

	try {
		const encoded = await new MovieExactEncoder(session.director).render({
			onProgress(progress) {
				updateExactProgress(session, progress);
				options.onProgress?.(progress);
			}
		});
		const result = createMovieExactRecordingResult(session.project, encoded);
		if (options.download !== false) {
			downloadMovieBlob(result.blob, result.fileName);
		}
		globalThis.AwtsmoosMovieExactRenderComplete = result;
		session.view.status.textContent = exactCompletionText(result);
		options.onComplete?.(result);
		return result;
	} catch (error) {
		globalThis.AwtsmoosMovieExactRenderError = error?.stack || String(error);
		session.view.status.textContent = `Exact render failed: ${error.message}`;
		throw error;
	} finally {
		button.disabled = false;
	}
}

function updateExactProgress(session, progress) {
	session.time = progress.time;
	session.timeline.setTime(progress.time);
	session.view.status.textContent = `Exact frame ${
		progress.frameNumber
	} / ${progress.expectedFrames} · ${progress.percent.toFixed(1)}%`;
}

function exactCompletionText(result) {
	return `Exact ${result.codec.toUpperCase()} complete · ${
		result.encodedFrames
	} frames · ${(result.bytes / 1048576).toFixed(2)} MB`;
}

export default renderExactMovieStudioSession;
