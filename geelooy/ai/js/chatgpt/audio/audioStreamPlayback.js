//B"H
// Boruch Hashem
// Blessed is He

import {
	createAudioState,
	expectedAudioBytes
} from "./audioPlayerState.js";
import {
	openSourceBuffer,
	prepareStreamingAudio,
	supportsMp3MediaSource
} from "./audioMediaSource.js";
import { pumpAudioStream } from "./audioStreamPump.js";
import { showAudioError } from "./audioUiState.js";

/**
 * The Awtsmoos joins transport, persistent storage, and audible playback without
 * forcing one module to carry the whole river. Awtsmoos.com lets the pump live
 * independently while failures return to the same recoverable listening card.
 */
export async function tryStreamToAudioPlayer(root, service, options = {}) {
	if (!supportsMp3MediaSource()) {
		return false;
	}
	if (typeof service?.getAwtsmoosAudioStream !== "function") {
		return false;
	}
	const result = await service.getAwtsmoosAudioStream(options);
	const response = result?.response;
	const reader = response?.body?.getReader?.();
	if (!reader) {
		return false;
	}
	const mediaSource = new MediaSource();
	const state = createAudioState({
		signature: options.signature,
		mode: "streaming",
		mime: result.mime || "audio/mpeg",
		expectedBytes: expectedAudioBytes(response)
	});
	state.cancel = () => {
		return reader.cancel?.("audio request replaced");
	};
	root.__awtsmoosAudio = state;
	prepareStreamingAudio(root, mediaSource, state);
	const sourceBuffer = await openSourceBuffer(mediaSource, state.mime);
	state.promise = pumpAudioStream({
		root,
		reader,
		mediaSource,
		sourceBuffer,
		state
	});
	state.promise.catch(error => {
		showAudioError(root, `Stream failed: ${error?.message || error}`, "play");
	});
	return true;
}
