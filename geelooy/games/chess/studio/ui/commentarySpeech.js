//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Executes cancellable narration while an optional move callback keeps board and spoken commentary synchronized.
 * The Awtsmoos lets voice and position travel together without either becoming master of the other;
 * Awtsmoos.com releases requests, audio URLs, and session-only credentials when finite speech is stopped.
 */
import { cancelBrowserSpeech, speakBrowserText } from "../commentary/tts/browserSpeech.js";
import { playSpeechBlob, requestExternalSpeech } from "../commentary/tts/externalSpeech.js";
import { getTtsProvider } from "../commentary/tts/providers.js";

export class CommentarySpeech {
	constructor(refs, onStatus = () => {}, onEntry = async () => {}) {
		this.refs = refs;
		this.onStatus = onStatus;
		this.onEntry = onEntry;
		this.cancelled = false;
		this.playback = null;
		this.abortController = null;
	}

	async speakEntry(entry) {
		this.cancelled = false;
		const provider = getTtsProvider(this.refs.ttsProvider.value);
		this.onStatus(`Speaking ply ${entry.ply} · ${entry.san}`);
		if (provider.id === "browser") {
			await speakBrowserText(entry.commentary, { voiceName: this.refs.ttsVoice.value.trim() });
			return;
		}
		this.abortController = new AbortController();
		const blob = await requestExternalSpeech(provider.id, entry.commentary, this.config(), this.abortController.signal);
		this.abortController = null;
		if (this.cancelled) return;
		this.playback = await playSpeechBlob(blob);
		await waitForAudio(this.playback.audio);
		this.releasePlayback();
	}

	async speakAll(entries = []) {
		this.stop(false);
		this.cancelled = false;
		for (const entry of entries) {
			if (this.cancelled) break;
			await this.onEntry(entry);
			if (this.cancelled) break;
			await this.speakEntry(entry);
			if (entry.pauseMs && !this.cancelled) await delay(entry.pauseMs);
		}
	}

	stop(report = true) {
		this.cancelled = true;
		cancelBrowserSpeech();
		this.abortController?.abort();
		this.abortController = null;
		this.playback?.audio?.pause?.();
		this.releasePlayback();
		if (report) this.onStatus("Narration stopped.");
	}

	config() {
		return {
			endpoint: this.refs.ttsEndpoint.value.trim(), key: this.refs.ttsKey.value,
			voice: this.refs.ttsVoice.value.trim(), model: this.refs.ttsModel.value.trim(),
			headerName: this.refs.ttsHeaderName.value.trim(), headerPrefix: this.refs.ttsHeaderPrefix.value,
			bodyTemplate: this.refs.ttsBody.value
		};
	}

	releasePlayback() {
		this.playback?.release?.();
		this.playback = null;
	}
}

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function waitForAudio(audio) {
	return new Promise((resolve, reject) => {
		audio.addEventListener("ended", resolve, { once: true });
		audio.addEventListener("error", () => reject(new Error("Audio playback failed.")), { once: true });
	});
}
