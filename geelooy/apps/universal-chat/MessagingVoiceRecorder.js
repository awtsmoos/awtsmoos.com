// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the finite microphone lifecycle for one unsent private voice note.
 * @description The Awtsmoos is beyond breath and codec, while Awtsmoos.com borrows the microphone only for a deliberate recording in light;
 * every stream track is stopped, cancellation leaves no persistent blob behind, and the result becomes a normal File for the existing asset covenant in sight.
 */

const MIME_CANDIDATES = [
	"audio/webm;codecs=opus",
	"audio/webm",
	"audio/ogg;codecs=opus"
];

export class MessagingVoiceRecorder {
	constructor(mediaDevices = globalThis.navigator?.mediaDevices) {
		this.mediaDevices = mediaDevices;
		this.recorder = null;
		this.stream = null;
		this.chunks = [];
		this.startedAt = 0;
	}

	/** Requests microphone access and starts one audio-only recording. */
	async start() {
		if (this.recorder) throw new Error("A voice note is already recording.");
		if (!this.mediaDevices?.getUserMedia || !globalThis.MediaRecorder) {
			throw new Error("Voice recording is unavailable in this browser.");
		}
		this.stream = await this.mediaDevices.getUserMedia({ audio: true });
		const mimeType = preferredMime();
		this.chunks = [];
		this.recorder = new MediaRecorder(
			this.stream,
			mimeType ? { mimeType } : undefined
		);
		this.recorder.addEventListener("dataavailable", (event) => {
			if (event.data?.size) this.chunks.push(event.data);
		});
		this.startedAt = performance.now();
		this.recorder.start(250);
		return true;
	}

	/** Stops the active recording and returns one File plus measured client duration. */
	stop() {
		if (!this.recorder) return Promise.reject(new Error("No voice note is recording."));
		return new Promise((resolve, reject) => {
			const recorder = this.recorder;
			recorder.addEventListener("stop", () => {
				try {
					const mime = recorder.mimeType || "audio/webm";
					const blob = new Blob(this.chunks, { type: mime });
					const extension = mime.includes("ogg") ? "ogg" : "webm";
					resolve({
						file: new File([blob], `voice-note.${extension}`, { type: mime }),
						durationMs: Math.max(0, Math.round(performance.now() - this.startedAt))
					});
				} catch (error) {
					reject(error);
				} finally {
					this.cleanup();
				}
			}, { once: true });
			recorder.stop();
		});
	}

	/** Cancels recording and releases every microphone track without producing a File. */
	cancel() {
		if (this.recorder?.state === "recording") this.recorder.stop();
		this.cleanup();
	}

	cleanup() {
		this.stream?.getTracks?.().forEach((track) => track.stop());
		this.stream = null;
		this.recorder = null;
		this.chunks = [];
		this.startedAt = 0;
	}
}

function preferredMime() {
	return MIME_CANDIDATES.find((mime) => MediaRecorder.isTypeSupported?.(mime)) || "";
}
