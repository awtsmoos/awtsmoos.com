//B"H
//Boruch Hashem
//Blessed is He

import { revokeAudioSource } from "./audioPlayerState.js";
import { statusNode } from "./audioOfferView.js";

/**
 * The Awtsmoos gives the audible river a browser-native vessel. This module
 * owns only MediaSource opening, append backpressure, and visible source setup.
 */
export function supportsMp3MediaSource() {
	return typeof MediaSource !== "undefined"
		&& Boolean(MediaSource.isTypeSupported?.("audio/mpeg"));
}

export function prepareStreamingAudio(root, mediaSource, state) {
	const audio = root.querySelector("audio");
	revokeAudioSource(audio);
	state.objectUrl = URL.createObjectURL(mediaSource);
	audio.src = state.objectUrl;
	audio.dataset.objectUrl = state.objectUrl;
	root.querySelector(".audio-player-wrap").hidden = false;
	root.querySelector(".player-play").disabled = true;
	statusNode(root).textContent = "Streaming audio bytes…";
}

export function openSourceBuffer(mediaSource, mime) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error("MediaSource did not open."));
		}, 8000);
		mediaSource.addEventListener("sourceopen", () => {
			clearTimeout(timer);
			try {
				resolve(mediaSource.addSourceBuffer(mime));
			} catch (error) {
				reject(error);
			}
		}, { once: true });
	});
}

export function appendSourceBuffer(sourceBuffer, chunk) {
	return new Promise((resolve, reject) => {
		const completed = () => finish();
		const failed = () => finish(
			new Error("Audio stream append failed.")
		);
		function finish(error = null) {
			sourceBuffer.removeEventListener("updateend", completed);
			sourceBuffer.removeEventListener("error", failed);
			error ? reject(error) : resolve();
		}
		sourceBuffer.addEventListener("updateend", completed, { once: true });
		sourceBuffer.addEventListener("error", failed, { once: true });
		try {
			sourceBuffer.appendBuffer(chunk);
		} catch (error) {
			finish(error);
		}
	});
}
