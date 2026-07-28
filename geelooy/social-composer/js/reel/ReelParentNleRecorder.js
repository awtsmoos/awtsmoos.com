// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReelParentNleRecorder
 * @description
 * The parent social realm drives the child NLE compositor and records requested
 * canvas frames into a truthful WebM while preserving child project and audio.
 */

import {
	createParentNleCapture,
	createParentNleRecorder,
	flushParentNleRecorder
} from './ReelParentNleCapture.js';

export async function renderParentNleMovie(studio, options = {}) {
	const app = studio.studio;
	if (!app?.compositor?.canvas || !app.state) {
		throw new Error('The embedded NLE canvas is unavailable.');
	}
	if (!globalThis.MediaRecorder) {
		throw new Error('This browser cannot record embedded movies.');
	}
	app.state.setRendering(true);
	app.state.setPlaying(false);
	let capture = null;
	try {
		await app.audio.resume();
		const project = app.state.project;
		const fps = bounded(project.fps, 1, 60, 30);
		capture = createParentNleCapture(app, fps);
		const recording = createParentNleRecorder(capture.stream);
		recording.recorder.start(200);
		app.audio.schedule(project, 0, app.audio.output);
		await renderParentFrames(app, project, capture, options.onProgress);
		await flushParentNleRecorder(recording.recorder, capture.requestFrame);
		recording.recorder.stop();
		await recording.completion;
		const mimeType = recording.recorder.mimeType || 'video/webm';
		const blob = new Blob(recording.chunks, { type: mimeType });
		return resultFromParentBlob(blob, project);
	} finally {
		app.audio.stop();
		capture?.stream.getTracks().forEach(track => track.stop());
		app.state.setRendering(false);
	}
}

async function renderParentFrames(app, project, capture, onProgress) {
	const started = performance.now();
	const captureDuration = Math.max(project.duration, 1.25);
	while (true) {
		const elapsed = (performance.now() - started) / 1000;
		const time = Math.min(project.duration, elapsed);
		app.compositor.draw(project, time);
		capture.requestFrame();
		app.state.setPlayhead(time);
		onProgress?.({
			percent: project.duration ? time / project.duration * 100 : 100,
			time
		});
		if (elapsed >= captureDuration) break;
		await new Promise(resolve => requestAnimationFrame(resolve));
	}
}

function resultFromParentBlob(blob, project) {
	const mimeType = blob.type || 'video/webm';
	return {
		blob,
		bytes: blob.size,
		duration: project.duration,
		fileName: `${slug(project.title)}.webm`,
		mimeType,
		projectTitle: project.title,
		resolution: { ...project.resolution }
	};
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Math.max(minimum, Math.min(maximum, Number.isFinite(number) ? number : fallback));
}

function slug(value) {
	return String(value || 'mitzvahworld-reel').toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60) || 'mitzvahworld-reel';
}
