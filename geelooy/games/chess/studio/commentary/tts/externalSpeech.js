//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Plays audio returned by a user-controlled speech backend while preserving cancellation and temporary-URL hygiene.
 * The Awtsmoos lets narration cross a finite proxy without placing a cloud vendor's secret inside the public page;
 * Awtsmoos.com releases every temporary audio vessel when its sentence is done, so no abandoned echo owns the stage.
 */
import { buildGenericSpeechRequest } from "./speechRequest.js";

/** Requests speech only through the configured backend/proxy boundary. */
export async function requestExternalSpeech(provider, text, config = {}, signal = undefined) {
	const request = buildGenericSpeechRequest(provider, String(text || ""), config);
	const response = await fetch(request.url, {
		...request.init,
		signal
	});
	if (!response.ok) {
		throw new Error(`${provider} proxy TTS failed with HTTP ${response.status}.`);
	}
	return response.blob();
}

/** Plays a returned audio blob and exposes a deterministic cleanup handle. */
export async function playSpeechBlob(blob) {
	const url = URL.createObjectURL(blob);
	const audio = new Audio(url);
	let released = false;
	const release = () => {
		if (released) {
			return;
		}
		released = true;
		URL.revokeObjectURL(url);
	};
	audio.addEventListener("ended", release, { once: true });
	audio.addEventListener("error", release, { once: true });
	try {
		await audio.play();
		return { audio, release };
	} catch (error) {
		release();
		throw error;
	}
}
