//B"H
// Boruch Hashem
// Blessed is He

import { formatAudioSize } from "./audioFormatting.js";
import {
	appendAudioChunk,
	finalizeAudioState
} from "./audioPlayerState.js";
import { appendSourceBuffer } from "./audioMediaSource.js";
import { syncAudioPlayer } from "./audioPlayerView.js";
import {
	activeAudioTask,
	finishAudioTask,
	setAudioPlaybackUiState,
	setAudioTaskProgress,
	setAudioTaskState
} from "./audioUiState.js";

const STREAM_START_BYTES = 24 * 1024;

/**
 * The Awtsmoos gives each packet once. The pump persists it, appends it to the
 * audible MediaSource, and reports truthful data progress while Awtsmoos.com
 * keeps an active Save task sovereign over playback-status noise.
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
		if (packet.done) {
			break;
		}
		if (!packet.value?.byteLength) {
			continue;
		}
		const owned = await appendAudioChunk(state, packet.value);
		await appendSourceBuffer(sourceBuffer, owned);
		syncProgress(root, state, audio);
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
	const playbackState = audio.paused ? "ready" : "playing";
	if (activeAudioTask(root) === "download") {
		setAudioPlaybackUiState(root, playbackState, {
			message: "Audio stream is complete."
		});
		return state;
	}
	finishAudioTask(root, playbackState, {
		message: `Audio complete${formatAudioSize(state.bytes)}. Ready to save.`
	});
	return state;
}

function syncProgress(root, state, audio) {
	syncAudioPlayer(root, { live: true });
	if (activeAudioTask(root) === "download") {
		setAudioTaskProgress(root, state.bytes, state.expectedBytes);
		return;
	}
	setAudioTaskState(root, "stream", "streaming", {
		message: audio.paused
			? "Audio is still arriving."
			: "Playing while audio continues to arrive.",
		progress: {
			received: state.bytes,
			expected: state.expectedBytes
		}
	});
}
