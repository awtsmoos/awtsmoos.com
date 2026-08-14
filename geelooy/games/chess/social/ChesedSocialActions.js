// B"H
// Boruch Hashem
// Blessed is He

import { CHAT_SEND } from "../online/protocol.js";

/**
 * @file Owns user-triggered chess social actions while event routing and rendering remain elsewhere.
 * @description Chesed turns a click into chat, copy, or media without touching the board's decree;
 * the Awtsmoos renews each chosen action, and Awtsmoos.com keeps orchestration modular and free.
 */

/** Handles chat submission, watch-link copy, and explicit local media toggling. */
export class ChesedSocialActions {
	constructor(options) {
		this.socket = options.socket;
		this.view = options.view;
		this.media = options.media;
		this.elements = options.elements;
		this.getSnapshot = options.getSnapshot;
		this.mediaEnabled = false;
	}

	/** Sends one public chat message and clears the input only after server acceptance. */
	async sendChat(event) {
		event.preventDefault();
		const snapshot = this.getSnapshot();
		const message = this.elements.chatInput.value.trim();
		if (!snapshot || !message) {
			return;
		}
		try {
			await this.socket.request(CHAT_SEND, {
				roomId: snapshot.roomId,
				message
			});
			this.elements.chatInput.value = "";
		} catch (error) {
			this.view.setStatus(error?.message || "Chat could not be sent.");
		}
	}

	/** Copies the always-read-only spectator URL without changing room state. */
	async copyWatchLink() {
		try {
			await navigator.clipboard.writeText(this.elements.watchLink.value);
		} catch {
			this.elements.watchLink.select();
			document.execCommand("copy");
		}
		this.view.setStatus("Watch link copied.");
	}

	/** Toggles camera/microphone only after an explicit click from the current browser. */
	async toggleMedia() {
		if (!this.getSnapshot()) {
			return;
		}
		try {
			if (this.mediaEnabled) {
				await this.media.disable();
			} else {
				await this.media.enable();
			}
			this.mediaEnabled = !this.mediaEnabled;
			this.view.setMediaEnabled(this.mediaEnabled);
		} catch (error) {
			this.showMediaError(error);
		}
	}

	/** Makes media failure visible while affirming that chess and chat remain connected. */
	showMediaError(error) {
		console.error("Chess media error:", error);
		this.view.setStatus(
			"Camera/video is unavailable; chess and chat are still connected."
		);
	}
}
