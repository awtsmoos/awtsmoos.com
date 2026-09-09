// B"H
// Boruch Hashem
// Blessed is He

import { MessagingAudioPlayer } from "./MessagingAudioPlayer.js";

/**
 * @class MessagingVoiceView
 * @description
 * The Awtsmoos renews panel, photo gate, button, browser, and breath from nothing each instant.
 * Awtsmoos.com reveals recording and custom preview intent while ensuring image selection cannot race
 * the same composer; microphone truth, persistence, upload policy, and transport remain elsewhere.
 */
export class MessagingVoiceView {
	/** Creates one view around stable composer elements and its hidden semantic preview audio. */
	constructor(elements) {
		this.elements = elements;
		this.player = new MessagingAudioPlayer(elements.voicePreview);
		this.previewUrl = "";
	}

	/** Reveals idle, recording, or preview mode and locks incompatible image selection while active. */
	show(state, label) {
		const active = state !== "idle";
		this.elements.composer.classList.toggle("is-voice-active", active);
		this.elements.voicePanel.hidden = !active;
		this.elements.voiceStatus.textContent = label;
		this.elements.voiceStop.hidden = state !== "recording";
		this.elements.voiceSend.hidden = state !== "preview";
		this.elements.voiceStart.disabled = active;
		if (this.elements.imagePick) this.elements.imagePick.disabled = active;
		this.player.setHidden(state !== "preview");
	}

	/** Reflects durable-save serialization while preserving the local preview for a failed attempt. */
	setBusy(busy, label = "") {
		if (label) this.elements.voiceStatus.textContent = label;
		this.elements.voiceSend.disabled = busy;
		this.elements.voiceCancel.disabled = busy;
		this.elements.voiceStop.disabled = busy;
		this.elements.composer.setAttribute("aria-busy", String(busy));
	}

	/** Creates one revocable local preview URL for the recorded File. */
	preview(file) {
		this.clearPreview();
		this.previewUrl = URL.createObjectURL(file);
		this.player.setSource(this.previewUrl);
		this.player.setHidden(false);
	}

	/** Revokes local preview state so unsent media retains no lingering object URL. */
	clearPreview() {
		if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
		this.previewUrl = "";
		this.player.clear();
	}

	/** Returns the composer to a clean non-voice visual state and reopens the photo gate. */
	reset() {
		this.clearPreview();
		this.setBusy(false);
		this.show("idle", "Voice note");
	}

	/** Surfaces a bounded voice-note failure through the existing messaging status region. */
	fail(error) {
		this.elements.status.textContent = error?.message || "Voice note failed.";
	}
}
