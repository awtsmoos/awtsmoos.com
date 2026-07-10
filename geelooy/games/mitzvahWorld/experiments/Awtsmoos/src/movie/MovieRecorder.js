// B"H
/**
 * @file MovieRecorder.js
 * @description Captures ordered real-time movie frames and optional live WebAudio into WebM.
 */
import { MovieAudioEngine } from './MovieAudioEngine.js';

function preferredMimeType(withAudio) {
	const candidates = withAudio
		? ['video/webm;codecs=vp8,opus', 'video/webm']
		: ['video/webm;codecs=vp8', 'video/webm'];
	return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
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
			const result = await this.recordStream(stream, options);
			this.lastBlob = result;
			this.lastResult = {
				blob: result,
				bytes: result.size,
				mimeType: result.type,
				fileName: this.project.render?.fileName || `Awtsmoos-Movie-${Date.now()}.webm`,
				duration: this.project.duration,
				fps: this.project.fps,
				audioTracks: stream.getAudioTracks().length,
				videoTracks: stream.getVideoTracks().length,
				audioContextState: this.audio.context?.state || 'unavailable'
			};
			if (options.download !== false) download(result, this.lastResult.fileName);
			options.onComplete?.(this.lastResult);
			return this.lastResult;
		} finally {
			for (const track of stream?.getTracks() || canvasStream.getTracks()) track.stop();
			await this.audio.stop();
			this.recording = false;
		}
	}

	recordStream(stream, options) {
		const withAudio = stream.getAudioTracks().length > 0;
		const mimeType = preferredMimeType(withAudio);
		const chunks = [];
		const recorder = new MediaRecorder(stream, {
			mimeType: mimeType || undefined,
			videoBitsPerSecond: Number(this.project.render?.videoBitsPerSecond || 4200000),
			audioBitsPerSecond: 160000
		});
		return new Promise((resolve, reject) => {
			recorder.ondataavailable = (event) => {
				if (event.data?.size) chunks.push(event.data);
			};
			recorder.onerror = (event) => reject(event.error || new Error('MediaRecorder failed.'));
			recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType || 'video/webm' }));
			recorder.start(500);
			this.director.seek(0);
			this.director.play({
				startAt: 0,
				onFrame: (frame) => options.onProgress?.({
					time: frame.time,
					percent: Math.min(100, frame.time / this.project.duration * 100)
				}),
				onEnd: () => {
					if (recorder.state !== 'recording') return;
					recorder.requestData();
					setTimeout(() => recorder.stop(), 140);
				}
			});
		});
	}
}

export default MovieRecorder;
