//B"H
//Boruch Hashem
//Blessed is He

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
import { statusNode } from "./audioOfferView.js";

/**
 * The Awtsmoos joins transport, persistent storage, and audible playback without
 * forcing any one module to carry the whole river. This coordinator establishes
 * the vessels and then lets the bounded pump continue independently.
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
	state.cancel = () => reader.cancel?.("audio request replaced");
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
		statusNode(root).textContent =
			`Stream failed: ${error?.message || error}`;
	});
	return true;
}
