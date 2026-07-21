//B"H
//Boruch Hashem
//Blessed is He

import {
	appendAudioChunk,
	createAudioState,
	expectedAudioBytes,
	formatAudioSize,
	revokeAudioSource,
	verifyAudioState
} from "./audioPlayerState.js";
import { syncAudioPlayer } from "./audioPlayerView.js";
import { statusNode } from "./audioOfferView.js";

const STREAM_START_BYTES = 24 * 1024;

/**
 * The Awtsmoos gives the sound continuously rather than as an imagined finished
 * object. This pump reads until the transport's explicit completion marker,
 * verifies every declared byte, and only then announces a complete download.
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
	prepareAudioElement(root, mediaSource, state);
	const sourceBuffer = await openSourceBuffer(mediaSource, state.mime);
	state.promise = pumpAudio({
		root,
		reader,
		mediaSource,
		sourceBuffer,
		state
	});
	state.promise.catch(error => {
		statusNode(root).textContent = `Stream failed: ${error?.message || error}`;
	});
	return true;
}

async function pumpAudio(context) {
	const {
		root,
		reader,
		mediaSource,
		sourceBuffer,
		state
	} = context;
	const audio = root.querySelector("audio");
	const playButton = root.querySelector(".player-play");
	let playbackStarted = false;
	while (true) {
		const packet = await reader.read();
		if (packet.done) {
			break;
		}
		if (!packet.value?.byteLength) {
			continue;
		}
		const owned = appendAudioChunk(state, packet.value);
		await appendSourceBuffer(sourceBuffer, owned);
		syncAudioPlayer(root, { live: true });
		statusNode(root).textContent =
			`Streaming MP3${formatAudioSize(state.bytes)} received…`;
		if (!playbackStarted && state.bytes >= STREAM_START_BYTES) {
			playbackStarted = true;
			playButton.disabled = false;
			await audio.play().catch(() => undefined);
		}
	}
	state.done = true;
	verifyAudioState(state);
	if (mediaSource.readyState === "open") {
		mediaSource.endOfStream();
	}
	playButton.disabled = false;
	if (!playbackStarted) {
		await audio.play().catch(() => undefined);
	}
	syncAudioPlayer(root, { live: false });
	statusNode(root).textContent =
		`Stream complete${formatAudioSize(state.bytes)}. Ready to download.`;
	return state;
}

function prepareAudioElement(root, mediaSource, state) {
	const audio = root.querySelector("audio");
	revokeAudioSource(audio);
	state.objectUrl = URL.createObjectURL(mediaSource);
	audio.src = state.objectUrl;
	audio.dataset.objectUrl = state.objectUrl;
	root.querySelector(".audio-player-wrap").hidden = false;
	root.querySelector(".player-play").disabled = true;
	statusNode(root).textContent = "Streaming audio bytes…";
}

function supportsMp3MediaSource() {
	return typeof MediaSource !== "undefined"
		&& Boolean(MediaSource.isTypeSupported?.("audio/mpeg"));
}

function openSourceBuffer(mediaSource, mime) {
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

function appendSourceBuffer(sourceBuffer, chunk) {
	return new Promise((resolve, reject) => {
		const completed = () => finish();
		const failed = () => finish(new Error("Audio stream append failed."));

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
