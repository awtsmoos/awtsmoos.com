// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the finite visual vessel and temporary preview URL for one unsent private voice note.
 * @description The Awtsmoos, Atzmus beyond form and division, renews panel, button, browser, and breath from nothing in every instant;
 * Awtsmoos.com lets this Malchus-like view reveal recording intent without owning microphone truth, upload policy, or private-message transport in sight.
 */

export class MessagingVoiceView {
	/**
	 * Creates one view around stable composer elements.
	 * @param {object} elements Stable messaging shell elements.
	 */
	constructor(elements) {
		this.elements = elements;
		this.previewUrl = "";
	}

	/**
	 * Reveals idle, recording, or preview mode while leaving media state to the controller.
	 * @param {"idle"|"recording"|"preview"} state Visual voice mode.
	 * @param {string} label Human-readable status text.
	 * @returns {void}
	 */
	show(state, label) {
		const active = state !== "idle";
		this.elements.composer.classList.toggle("is-voice-active", active);
		this.elements.voicePanel.hidden = !active;
		this.elements.voiceStatus.textContent = label;
		this.elements.voiceStop.hidden = state !== "recording";
		this.elements.voiceSend.hidden = state !== "preview";
		this.elements.voiceStart.disabled = active;
	}

	/**
	 * Reflects upload/send serialization while preserving preview for retry.
	 * @param {boolean} busy Whether a remote transition is running.
	 * @param {string} [label] Optional replacement status label.
	 * @returns {void}
	 */
	setBusy(busy, label = "") {
		if (label) this.elements.voiceStatus.textContent = label;
		this.elements.voiceSend.disabled = busy;
		this.elements.voiceCancel.disabled = busy;
		this.elements.voiceStop.disabled = busy;
		this.elements.composer.setAttribute("aria-busy", String(busy));
	}

	/**
	 * Creates one revocable local preview URL for the recorded File.
	 * @param {File} file Browser-created recording file.
	 * @returns {void}
	 */
	preview(file) {
		this.clearPreview();
		this.previewUrl = URL.createObjectURL(file);
		this.elements.voicePreview.src = this.previewUrl;
		this.elements.voicePreview.hidden = false;
	}

	/** Revokes local preview state so unsent media retains no lingering object URL. */
	clearPreview() {
		if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
		this.previewUrl = "";
		this.elements.voicePreview.removeAttribute("src");
		this.elements.voicePreview.hidden = true;
	}

	/** Returns the composer to a clean non-voice visual state. */
	reset() {
		this.clearPreview();
		this.setBusy(false);
		this.show("idle", "Voice note");
	}

	/**
	 * Surfaces a bounded voice-note failure through the existing messaging status region.
	 * @param {Error} error Failure translated for the current person.
	 * @returns {void}
	 */
	fail(error) {
		this.elements.status.textContent = error?.message || "Voice note failed.";
	}
}
