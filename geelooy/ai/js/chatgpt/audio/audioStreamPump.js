//B"H
//Boruch Hashem
//Blessed is He

import {
	appendAudioChunk,
	finalizeAudioState,
	formatAudioSize
} from "./audioPlayerState.js";
import { appendSourceBuffer } from "./audioMediaSource.js";
import { syncAudioPlayer } from "./audioPlayerView.js";
import { statusNode } from "./audioOfferView.js";

const STREAM_START_BYTES = 24 * 1024;

/**
 * The Awtsmoos gives each packet once. The pump persists it, appends it to the
 * audible MediaSource, updates evidence, and releases the transient chunk.
 */
export async function pumpAudioStream(context) {
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
		if (packet.done) break;
		if (!packet.value?.byteLength) continue;
		const owned = await appendAudioChunk(state, packet.value);
		await appendSourceBuffer(sourceBuffer, owned);
		syncProgress(root, state);
		if (!playbackStarted && state.bytes >= STREAM_START_BYTES) {
			playbackStarted = true;
			playButton.disabled = false;
			await audio.play().catch(() => undefined);
		}
	}
	await finalizeAudioState(state);
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

function syncProgress(root, state) {
	syncAudioPlayer(root, { live: true });
	statusNode(root).textContent =
		`Streaming MP3${formatAudioSize(state.bytes)} received…`;
}
