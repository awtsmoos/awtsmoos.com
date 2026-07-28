// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleMovieRecorder
 * @description
 * The same canvas preview becomes a real browser movie Blob. Explicit frame
 * requests preserve embedded rendering while every exit releases finite resources.
 */

import { createNleCaptureStream } from './NleCaptureStream.js';
import {
	chooseNleRecorderMime,
	nleMovieFileName
} from './NleRecorderFormat.js';

export class NleMovieRecorder {
	constructor({ state, compositor, audio }) {
		Object.assign(this, { state, compositor, audio });
	}

	async render(options = {}) {
		if (!globalThis.MediaRecorder) throw new Error('This browser cannot record movies.');
		this.state.setRendering(true);
		this.state.setPlaying(false);
		let capture = null;
		try {
			await this.audio.resume();
			const project = this.state.project;
			const fps = Math.max(1, Math.min(60, Number(project.fps || 30)));
			capture = createNleCaptureStream(this.compositor.canvas, this.audio.output, fps);
			const mimeType = chooseNleRecorderMime();
			const recorder = new MediaRecorder(capture.stream, mimeType ? { mimeType } : undefined);
			const chunks = [];
			recorder.addEventListener('dataavailable', event => {
				if (event.data.size) chunks.push(event.data);
			});
			const completion = recorderCompletion(recorder);
			recorder.start(200);
			this.audio.schedule(project, 0, this.audio.output);
			await this.renderFrames(project, performance.now(), options.onProgress, capture);
			await flushRecorder(recorder, capture);
			recorder.stop();
			await completion;
			const type = recorder.mimeType || mimeType || 'video/webm';
			return this.result(new Blob(chunks, { type }), project);
		} finally {
			this.audio.stop();
			capture?.stream.getTracks().forEach(track => track.stop());
			this.state.setRendering(false);
		}
	}

	async renderFrames(project, started, onProgress, capture) {
		const captureDuration = Math.max(project.duration, 1.25);
		while (true) {
			const elapsed = (performance.now() - started) / 1000;
			const time = Math.min(project.duration, elapsed);
			this.compositor.draw(project, time);
			capture.requestFrame();
			this.state.setPlayhead(time);
			onProgress?.({
				percent: project.duration ? time / project.duration * 100 : 100,
				time
			});
			if (elapsed >= captureDuration) break;
			await new Promise(resolve => requestAnimationFrame(resolve));
		}
	}

	result(blob, project) {
		const mimeType = blob.type || 'video/webm';
		return {
			blob,
			bytes: blob.size,
			duration: project.duration,
			fileName: nleMovieFileName(project.title, mimeType),
			mimeType,
			projectTitle: project.title,
			resolution: { ...project.resolution }
		};
	}
}

function recorderCompletion(recorder) {
	return new Promise((resolve, reject) => {
		recorder.addEventListener('stop', resolve, { once: true });
		recorder.addEventListener('error', () => {
			reject(recorder.error || new Error('Movie recording failed.'));
		}, { once: true });
	});
}

async function flushRecorder(recorder, capture) {
	if (recorder.state !== 'recording') return;
	capture.requestFrame();
	recorder.requestData?.();
	await new Promise(resolve => setTimeout(resolve, 180));
}
