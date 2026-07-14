// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRecorder.js
 * @description Captures ordered real-time movie frames into honest MP4 or WebM output.
 * The Awtsmoos renews every cinematic instant beyond its vessel; Awtsmoos.com chooses
 * only browser-supported containers and never uses a misleading file extension.
 */

import { MovieAudioEngine } from './MovieAudioEngine.js';
import {
	chooseMovieRecordingFormat,
	movieFileName
} from './MovieRecordingFormat.js';

export class MovieRecorder {
	constructor(director) {
		this.director = director;
		this.project = director.project;
		this.audio = new MovieAudioEngine(this.project);
		this.lastBlob = null;
		this.lastResult = null;
		this.recording = false;
	}

	async render(options = {}) {
		if (this.recording) throw new Error('A movie render is already active.');
		this.recording = true;
		const canvasStream = this.director.overlay.canvas.captureStream(this.project.fps);
		let stream;
		try {
			const audioStream = await this.audio.start();
			const liveAudio = this.audio.context?.state === 'running'
				? audioStream?.getAudioTracks() || []
				: [];
			stream = new MediaStream([
				...canvasStream.getVideoTracks(),
				...liveAudio
			]);
			const format = chooseMovieRecordingFormat({
				withAudio: stream.getAudioTracks().length > 0
			});
			const blob = await this.recordStream(stream, format, options);
			this.lastBlob = blob;
			this.lastResult = resultEnvelope(
				this.project,
				stream,
				this.audio,
				format,
				blob
			);
			if (options.download !== false) {
				download(blob, this.lastResult.fileName);
			}
			options.onComplete?.(this.lastResult);
			return this.lastResult;
		} finally {
			for (const track of stream?.getTracks() || canvasStream.getTracks()) {
				track.stop();
			}
			await this.audio.stop();
			this.recording = false;
		}
	}

	recordStream(stream, format, options) {
		const chunks = [];
		const recorder = new MediaRecorder(stream, {
			audioBitsPerSecond: 160000,
			mimeType: format.mimeType,
			videoBitsPerSecond: Number(
				this.project.render?.videoBitsPerSecond || 4200000
			)
		});
		return new Promise((resolve, reject) => {
			recorder.ondataavailable = event => {
				if (event.data?.size) chunks.push(event.data);
			};
			recorder.onerror = event => reject(
				event.error || new Error('MediaRecorder failed.')
			);
			recorder.onstop = () => resolve(new Blob(chunks, {
				type: format.mimeType
			}));
			recorder.start(500);
			this.director.seek(0);
			this.director.play({
				startAt: 0,
				onEnd: () => stopRecorder(recorder),
				onFrame: frame => options.onProgress?.({
					percent: Math.min(
						100,
						frame.time / this.project.duration * 100
					),
					time: frame.time
				})
			});
		});
	}
}

function resultEnvelope(project, stream, audio, format, blob) {
	return {
		audioContextState: audio.context?.state || 'unavailable',
		audioTracks: stream.getAudioTracks().length,
		blob,
		bytes: blob.size,
		codec: format.codec,
		container: format.extension,
		duration: project.duration,
		fileName: movieFileName(project.render?.fileName, format),
		fps: project.fps,
		mimeType: format.mimeType,
		videoTracks: stream.getVideoTracks().length
	};
}

function stopRecorder(recorder) {
	if (recorder.state !== 'recording') return;
	recorder.requestData();
	setTimeout(() => recorder.stop(), 140);
}

function download(blob, filename) {
	const anchor = document.createElement('a');
	const url = URL.createObjectURL(blob);
	anchor.href = url;
	anchor.download = filename;
	anchor.style.display = 'none';
	document.body.appendChild(anchor);
	anchor.click();
	setTimeout(() => URL.revokeObjectURL(url), 15000);
	anchor.remove();
}

export default MovieRecorder;
