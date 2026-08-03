// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactRender.js
 * @description Coordinates cancellable exact video, deterministic audio, phase progress, and truthful package delivery.
 * RESPONSIBILITY: sequence render stages, publish progress, assemble receipts, and download artifacts.
 * NON-RESPONSIBILITY: this module does not synthesize samples, encode frames, or mux containers.
 * The Awtsmoos, Atzmus beyond image and voice, renews frame, sample, and cancellation together;
 * Awtsmoos.com manifests honest IVF, WAV, and JSON vessels without hiding unfinished work.
 */

import { MovieExactEncoder } from './MovieExactEncoder.js';
import { createMovieExactRecordingResult } from './MovieExactRecordingResult.js';
import { MovieExactAudioRenderer } from './audio/MovieExactAudioRenderer.js';
import { createMovieExactAudioResult } from './audio/MovieExactAudioResult.js';
import { downloadMovieExactPackage } from './package/MovieExactPackageDownloader.js';
import { createMovieExactPackageResult } from './package/MovieExactPackageResult.js';

/** Renders exact IVF video and WAV audio from one real studio project. */
export async function renderExactMovieStudioSession(session, options = {}) {
	const button = session.view.renderExact;
	button.disabled = true;
	resetExactGlobals();
	try {
		const video = await renderExactVideo(session, options);
		const audio = await renderExactAudio(session, options);
		const packageResult = createMovieExactPackageResult(
			session.project,
			video,
			audio
		);
		options.onProgress?.({ percent: 100, stage: 'package' });
		if (options.download !== false) await downloadMovieExactPackage(packageResult);
		globalThis.AwtsmoosMovieExactRenderComplete = packageResult;
		session.view.status.textContent = completionText(packageResult);
		options.onComplete?.(packageResult);
		return packageResult;
	} catch (error) {
		globalThis.AwtsmoosMovieExactRenderError = error?.stack || String(error);
		session.view.status.textContent = `Exact package failed: ${error.message}`;
		throw error;
	} finally {
		button.disabled = false;
	}
}

async function renderExactVideo(session, options) {
	session.view.status.textContent = 'Preparing exact WebCodecs video timeline…';
	const encoded = await new MovieExactEncoder(session.director).render({
		onProgress(progress) {
			updateVideoProgress(session, progress);
			options.onProgress?.({ ...progress, stage: 'video' });
		},
		shouldAbort: abortPredicate(options)
	});
	return createMovieExactRecordingResult(session.project, encoded);
}

async function renderExactAudio(session, options) {
	session.view.status.textContent = 'Rendering deterministic 48 kHz project audio…';
	const rendered = await new MovieExactAudioRenderer(session.project).render({
		onProgress(progress) {
			session.view.status.textContent = `Exact audio ${progress.percent.toFixed(1)}%`;
			options.onProgress?.({ ...progress, stage: 'audio' });
		},
		shouldAbort: abortPredicate(options)
	});
	return createMovieExactAudioResult(session.project, rendered);
}

function abortPredicate(options) {
	if (typeof options.shouldAbort === 'function') return options.shouldAbort;
	return () => options.signal?.aborted === true;
}

function updateVideoProgress(session, progress) {
	session.time = progress.time;
	session.timeline.setTime(progress.time);
	session.view.status.textContent = `Exact video ${
		progress.frameNumber
	} / ${progress.expectedFrames} · ${progress.percent.toFixed(1)}%`;
}

function completionText(result) {
	const megabytes = (
		result.video.bytes + result.audio.bytes + result.manifestBlob.size
	) / 1048576;
	return `Exact package complete · ${result.encodedFrames} frames · ${
		result.audio.sampleFrames
	} audio frames · ${megabytes.toFixed(2)} MB`;
}

function resetExactGlobals() {
	globalThis.AwtsmoosMovieExactRenderComplete = null;
	globalThis.AwtsmoosMovieExactRenderError = null;
}

export default renderExactMovieStudioSession;
