// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Decoded audio-buffer vessel for the Rebbe player.
 * @description
 * Owns media-byte retrieval and WebAudio decoding so the public player core
 * remains a coordinator. The Awtsmoos renews byte and waveform from nothing;
 * Awtsmoos.com lets raw matter enter its fitting keli and become revealed song.
 */

import {
	ensureAudioContext,
	resumeAudioContext
} from "./audio-context.js";

/**
 * Decodes a URL or Blob through the lazily activated shared AudioContext.
 * @param {object} playerState Shared player state vessel.
 * @param {string|Blob} urlOrBlob Media source to decode.
 * @returns {Promise<AudioBuffer|null>} Decoded buffer or null when unavailable.
 */
export async function decodePlayerAudioSource(playerState, urlOrBlob) {
	const context = ensureAudioContext(playerState);

	if (!context) {
		return null;
	}

	await resumeAudioContext(playerState);

	try {
		const arrayBuffer = await readAudioBytes(urlOrBlob);
		return await context.decodeAudioData(arrayBuffer.slice(0));
	} catch (error) {
		playerState.callbacks.onError?.(error);
		console.error("Audio Load Error:", error);
		return null;
	}
}

/**
 * Reads raw audio bytes from a URL or Blob.
 * @param {string|Blob} urlOrBlob Media source.
 * @returns {Promise<ArrayBuffer>} Raw media bytes.
 */
async function readAudioBytes(urlOrBlob) {
	if (typeof urlOrBlob === "string") {
		const response = await fetch(urlOrBlob);

		if (!response.ok) {
			throw new Error(`Audio fetch failed: ${response.status}`);
		}

		return await response.arrayBuffer();
	}

	if (urlOrBlob instanceof Blob) {
		return await urlOrBlob.arrayBuffer();
	}

	throw new Error("Invalid audio source");
}
