// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRecorder.js
 * @description Captures deterministic browser-native movies with frame telemetry.
 * The Awtsmoos renews every cinematic instant beyond the canvas; Awtsmoos.com
 * submits each intended frame explicitly and reports the actual finite vessel used.
 */

import { MovieAudioEngine } from './MovieAudioEngine.js';
import {
	combineMovieCaptureStreams,
	createMovieCanvasCapture
} from './MovieCanvasCapture.js';
import { chooseMovieRecordingFormat } from './MovieRecordingFormat.js';
import {
	createMovieRecordingResult,
	downloadMovieBlob
} from './MovieRecordingResult.js';
import { recordMovieStream } from './MovieRecorderSession.js';

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
		let capture = null;
		let stream = null;

		try {
			capture = createMovieCanvasCapture(
				this.director.overlay.canvas,
				this.project.fps
			);
			stream = await this.createStream(capture.stream);
			const format = chooseMovieRecordingFormat({
				withAudio: stream.getAudioTracks().length > 0
			});
			const recorded = await recordMovieStream({
				captureMode: capture.captureMode,
				director: this.director,
				format,
				onProgress: options.onProgress,
				project: this.project,
				stream,
				track: capture.track
			});
			this.lastBlob = recorded.blob;
			this.lastResult = createMovieRecordingResult({
				audio: this.audio,
				blob: recorded.blob,
				format,
				project: this.project,
				stream,
				telemetry: recorded.telemetry
			});
			this.completeRender(options);
			return this.lastResult;
		} finally {
			stopTracks(stream || capture?.stream);
			await this.audio.stop();
			this.recording = false;
		}
	}

	async createStream(videoStream) {
		const audioStream = await this.audio.start();
		return combineMovieCaptureStreams(
			videoStream,
			audioStream,
			this.audio.context?.state
		);
	}

	completeRender(options) {
		if (options.download !== false) {
			downloadMovieBlob(this.lastBlob, this.lastResult.fileName);
		}
		options.onComplete?.(this.lastResult);
	}
}

function stopTracks(stream) {
	for (const track of stream?.getTracks() || []) {
		track.stop();
	}
}

export default MovieRecorder;
