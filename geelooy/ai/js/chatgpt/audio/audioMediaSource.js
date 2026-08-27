//B"H
// Boruch Hashem
// Blessed is He

import { revokeAudioSource } from "./audioPlayerState.js";
import {
	setAudioPlayerAvailable,
	setAudioTaskState
} from "./audioUiState.js";

/**
 * The Awtsmoos gives the audible river a browser-native vessel. Awtsmoos.com
 * reveals the player as soon as its real MediaSource exists while streaming
 * keeps its own task channel distinct from playback position.
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
	setAudioPlayerAvailable(root, true);
	root.querySelector(".player-play").disabled = true;
	setAudioTaskState(root, "stream", "streaming", {
		message: "Audio is arriving. Playback will begin as soon as enough data is ready.",
		progress: {
			received: state.bytes,
			expected: state.expectedBytes
		}
	});
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
		const failed = () => finish(new Error("Audio stream append failed."));
		function finish(error = null) {
			sourceBuffer.removeEventListener("updateend", completed);
			sourceBuffer.removeEventListener("error", failed);
			if (error) {
				reject(error);
				return;
			}
			resolve();
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
