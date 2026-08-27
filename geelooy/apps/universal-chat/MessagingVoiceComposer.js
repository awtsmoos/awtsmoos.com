// B"H
// Boruch Hashem
// Blessed is He

import { MessagingVoiceClock } from "./MessagingVoiceClock.js";
import { MessagingVoiceDelivery } from "./MessagingVoiceDelivery.js";
import { MessagingVoiceRecorder } from "./MessagingVoiceRecorder.js";
import { MessagingVoiceView } from "./MessagingVoiceView.js";

/**
 * @file Owns the local private voice-note lifecycle from microphone through preview, retry, and cleanup.
 * @description The Awtsmoos, Atzmus beyond every division, renews breath, browser, clock, and conversation from nothing in every instant;
 * Awtsmoos.com lets this Tiferes-like coordinator join local recording and visible intent while remote delivery flows through its own vessel of light.
 */

export class MessagingVoiceComposer {
	/**
	 * Composes the local voice state machine around explicit recorder, view, clock, and delivery dependencies.
	 * @param {object} options Voice-note dependencies and current-room resolver.
	 */
	constructor(options) {
		Object.assign(this, options);
		this.recorder = options.recorder || new MessagingVoiceRecorder();
		this.clock = new MessagingVoiceClock(this.elements.voiceElapsed);
		this.view = new MessagingVoiceView(this.elements);
		this.delivery = options.delivery || new MessagingVoiceDelivery({
			...options,
			onStage: (label) => this.view.setBusy(true, label)
		});
		this.recording = null;
		this.busy = false;
		this.bind();
	}

	/** Binds semantic voice controls to one reusable local state machine. */
	bind() {
		this.elements.voiceStart?.addEventListener("click", () => this.startSafely());
		this.elements.voiceStop?.addEventListener("click", () => this.previewSafely());
		this.elements.voiceCancel?.addEventListener("click", () => this.reset());
		this.elements.voiceSend?.addEventListener("click", () => this.sendSafely());
	}

	/** Requests microphone access and enters visible recording state. */
	async start() {
		if (this.busy || this.recording) return false;
		this.view.clearPreview();
		await this.recorder.start();
		this.clock.start();
		this.view.show("recording", "Recording…");
		return true;
	}

	/** Stops recording and materializes a local, revocable preview. */
	async preview() {
		if (this.busy) return false;
		this.recording = await this.recorder.stop();
		this.clock.stop();
		this.view.preview(this.recording.file);
		this.view.show("preview", "Voice note ready");
		return true;
	}

	/**
	 * Delegates accepted delivery and clears local state only after remote success.
	 * @returns {Promise<boolean>} True after accepted delivery; false when no valid local recording exists.
	 */
	async send() {
		if (this.busy || !this.recording?.file) return false;
		this.setBusy(true, "Uploading…");
		try {
			const delivered = await this.delivery.send(this.recording);
			if (!delivered) {
				this.setBusy(false, "Voice note unavailable");
				return false;
			}
			this.reset();
			this.elements.text?.focus({ preventScroll: true });
			return true;
		} catch (error) {
			this.setBusy(false, "Send failed · try again");
			throw error;
		}
	}

	/** Releases recorder, clock, preview, and visual state for room changes or explicit cancellation. */
	reset() {
		this.clock.reset();
		this.recorder.cancel();
		this.recording = null;
		this.busy = false;
		this.view.reset();
	}

	/** Serializes remote transitions so duplicate voice sends cannot race. */
	setBusy(busy, label) {
		this.busy = busy;
		this.view.setBusy(busy, label);
	}

	/** Starts recording and translates failure into the shared status region. */
	startSafely() {
		this.start().catch((error) => this.view.fail(error));
	}

	/** Stops for preview and translates failure into the shared status region. */
	previewSafely() {
		this.preview().catch((error) => this.view.fail(error));
	}

	/** Sends the current preview and translates failure into the shared status region. */
	sendSafely() {
		this.send().catch((error) => this.view.fail(error));
	}
}
