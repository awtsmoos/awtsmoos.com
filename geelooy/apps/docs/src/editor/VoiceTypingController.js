// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Provides optional browser-native voice typing for Awtsmoos Docs.
 * @description The Awtsmoos is beyond voice and letter; Awtsmoos.com lets spoken
 * breath become editable text only through an explicit user gesture and the browser's own permission vessel.
 */
export class VoiceTypingController {
	constructor({ editor, toast }) {
		this.editor = editor;
		this.toast = toast;
		this.recognition = null;
		this.active = false;
	}

	toggle() {
		if (this.active) {
			this.stop();
			return false;
		}
		return this.start();
	}

	start() {
		const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!Recognition) {
			this.toast.show("Voice typing is not available in this browser.", "warning");
			return false;
		}
		if (!this.editor.isEditable()) return false;
		this.recognition = new Recognition();
		this.recognition.continuous = true;
		this.recognition.interimResults = true;
		this.recognition.lang = document.documentElement.lang || "en-US";
		this.recognition.addEventListener("result", event => this.#result(event));
		this.recognition.addEventListener("end", () => this.#ended());
		this.recognition.addEventListener("error", event => this.#error(event));
		this.active = true;
		this.recognition.start();
		this.toast.show("Voice typing listening…", "neutral");
		return true;
	}

	stop() {
		this.recognition?.stop();
		this.active = false;
		this.toast.show("Voice typing stopped", "neutral");
	}

	#result(event) {
		let finalText = "";
		for (let index = event.resultIndex; index < event.results.length; index += 1) {
			const result = event.results[index];
			if (result.isFinal) finalText += result[0]?.transcript || "";
		}
		if (!finalText) return;
		this.editor.focus();
		document.execCommand("insertText", false, `${finalText.trim()} `);
		this.editor.notifyMutation();
	}

	#ended() {
		const wasActive = this.active;
		this.active = false;
		this.recognition = null;
		if (wasActive) this.toast.show("Voice typing ended", "neutral");
	}

	#error(event) {
		this.active = false;
		this.toast.show(`Voice typing: ${event.error || "unavailable"}`, "warning");
	}
}
