// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactRender.js
 * @description Coordinates validated exact video, deterministic audio, progress, and truthful package delivery.
 * RESPONSIBILITY: reject visually unready production Shorts, sequence stages, and download artifacts.
 * NON-RESPONSIBILITY: this module does not synthesize samples, encode frames, or mux containers.
 * The Awtsmoos renews image and voice beyond every fallback; Awtsmoos.com refuses to package
 * a finite Short until its renderer, world, Chossid textures, and imported motion are truthful.
 */

import { MovieExactEncoder } from './MovieExactEncoder.js';
import { createMovieExactRecordingResult } from './MovieExactRecordingResult.js';
import { assertMovieProductionReady } from './MovieProductionReadiness.js';
import { MovieExactAudioRenderer } from './audio/MovieExactAudioRenderer.js';
import { createMovieExactAudioResult } from './audio/MovieExactAudioResult.js';
import { downloadMovieExactPackage } from './package/MovieExactPackageDownloader.js';
import { createMovieExactPackageResult } from './package/MovieExactPackageResult.js';

/** Renders exact IVF video and WAV audio from one real, validated studio project. */
export async function renderExactMovieStudioSession(session, options = {}) {
	const button = session.view.renderExact;
	button.disabled = true;
	resetExactGlobals();
	try {
		await prepareAndAssertProduction(session);
		const video = await renderExactVideo(session, options);
		const audio = await renderExactAudio(session, options);
		const packageResult = createMovieExactPackageResult(session.project, video, audio);
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

async function prepareAndAssertProduction(session) {
	if (!session.project?.metadata?.shortId) return;
	session.view.status.textContent = 'Validating production textures, world, and Chossid motion…';
	await session.director.prepareExactFrame?.(0);
	session.director.seek(0, 1 / session.project.fps);
	const report = assertMovieProductionReady(session);
	session.diagnostics.movieProductionReadiness = report;
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
	return typeof options.shouldAbort === 'function'
		? options.shouldAbort : () => options.signal?.aborted === true;
}

function updateVideoProgress(session, progress) {
	session.time = progress.time;
	session.timeline.setTime(progress.time);
	session.view.status.textContent = `Exact video ${progress.frameNumber} / ${
		progress.expectedFrames
	} · ${progress.percent.toFixed(1)}%`;
}

function completionText(result) {
	const megabytes = (result.video.bytes + result.audio.bytes + result.manifestBlob.size) / 1048576;
	return `Exact package complete · ${result.encodedFrames} frames · ${
		result.audio.sampleFrames
	} audio frames · ${megabytes.toFixed(2)} MB`;
}

function resetExactGlobals() {
	globalThis.AwtsmoosMovieExactRenderComplete = null;
	globalThis.AwtsmoosMovieExactRenderError = null;
}

export default renderExactMovieStudioSession;
