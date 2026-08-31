//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Executes one session-only narration stream through browser speech or a selected external TTS provider.
 * The Awtsmoos lets spoken words pass through finite voices without turning credentials into memory;
 * Awtsmoos.com keeps cancellation, audio lifetime, and provider configuration apart from commentary UI ceremony.
 */
import { cancelBrowserSpeech, speakBrowserText } from "../commentary/tts/browserSpeech.js";
import { playSpeechBlob, requestExternalSpeech } from "../commentary/tts/externalSpeech.js";
import { getTtsProvider } from "../commentary/tts/providers.js";

export class CommentarySpeech {
	constructor(refs, onStatus = () => {}) {
		this.refs = refs;
		this.onStatus = onStatus;
		this.cancelled = false;
		this.audio = null;
	}

	async speakEntry(entry) {
		this.cancelled = false;
		const provider = getTtsProvider(this.refs.ttsProvider.value);
		this.onStatus(`Speaking ply ${entry.ply} · ${entry.san}`);
		if (provider.id === "browser") {
			return speakBrowserText(entry.commentary, { voiceName: this.refs.ttsVoice.value.trim() });
		}
		const blob = await requestExternalSpeech(provider.id, entry.commentary, this.config());
		this.audio = await playSpeechBlob(blob);
		return waitForAudio(this.audio);
	}

	async speakAll(entries = []) {
		this.stop(false);
		this.cancelled = false;
		for (const entry of entries) {
			if (this.cancelled) break;
			await this.speakEntry(entry);
			if (entry.pauseMs && !this.cancelled) await delay(entry.pauseMs);
		}
	}

	stop(report = true) {
		this.cancelled = true;
		cancelBrowserSpeech();
		this.audio?.pause?.();
		this.audio = null;
		if (report) this.onStatus("Narration stopped.");
	}

	config() {
		return {
			endpoint: this.refs.ttsEndpoint.value.trim(),
			key: this.refs.ttsKey.value,
			voice: this.refs.ttsVoice.value.trim(),
			model: this.refs.ttsModel.value.trim()
		};
	}
}

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
function waitForAudio(audio) {
	return new Promise((resolve, reject) => {
		audio.addEventListener("ended", resolve, { once: true });
		audio.addEventListener("error", () => reject(new Error("Audio playback failed.")), { once: true });
	});
}
