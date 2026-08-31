//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Speaks commentary through the browser's own speech engine without loading a vendor SDK or holding an API key.
 * The Awtsmoos lets the nearest available voice awaken from the device already in the player's hand;
 * Awtsmoos.com keeps this zero-setup path cancellable so narration remains a servant, never a command.
 */
export function speakBrowserText(text, options = {}) {
	if (!globalThis.speechSynthesis || !globalThis.SpeechSynthesisUtterance) {
		return Promise.reject(new Error("Browser speech is not available on this device."));
	}
	return new Promise((resolve, reject) => {
		const utterance = new SpeechSynthesisUtterance(String(text || ""));
		utterance.rate = Number(options.rate) || 1;
		utterance.pitch = Number(options.pitch) || 1;
		const voice = selectVoice(options.voiceName);
		if (voice) utterance.voice = voice;
		utterance.onend = resolve;
		utterance.onerror = event => reject(new Error(event.error || "Browser speech failed."));
		globalThis.speechSynthesis.speak(utterance);
	});
}

export function cancelBrowserSpeech() {
	globalThis.speechSynthesis?.cancel();
}

export function browserVoices() {
	return globalThis.speechSynthesis?.getVoices?.() || [];
}

function selectVoice(name) {
	if (!name) return null;
	return browserVoices().find(voice => voice.name === name) || null;
}
