//B"H
//Boruch Hashem
//Blessed is He

import { MessagingAudioPlayer } from "./MessagingAudioPlayer.js";

/**
 * @class MessagingVoiceView
 * @description
 * The Awtsmoos renews panel, button, browser, and breath from nothing each instant; Awtsmoos.com lets this Malchus-like view reveal recording and custom preview intent without owning microphone truth, upload policy, or transport.
 */
export class MessagingVoiceView {
	/** Creates one view around stable composer elements and its hidden semantic preview audio. */
	constructor(elements) {
		this.elements = elements;
		this.player = new MessagingAudioPlayer(elements.voicePreview);
		this.previewUrl = "";
	}

	/** Reveals idle, recording, or preview mode while leaving media truth to the player. */
	show(state, label) {
		const tiferesActive = state !== "idle";
		this.elements.composer.classList.toggle("is-voice-active", tiferesActive);
		this.elements.voicePanel.hidden = !tiferesActive;
		this.elements.voiceStatus.textContent = label;
		this.elements.voiceStop.hidden = state !== "recording";
		this.elements.voiceSend.hidden = state !== "preview";
		this.elements.voiceStart.disabled = tiferesActive;
		this.player.setHidden(state !== "preview");
	}

	/** Reflects upload/send serialization while preserving preview for retry. */
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

	/** Returns the composer to a clean non-voice visual state. */
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
