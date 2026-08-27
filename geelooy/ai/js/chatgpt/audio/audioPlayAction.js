//B"H
// Boruch Hashem
// Blessed is He

import { loadBlobAudioPlayer } from "./audioPlayerView.js";
import { resetAudioState } from "./audioPlayerState.js";
import { setAudioBusy } from "./audioOfferView.js";
import {
	setAudioPlayerAvailable,
	setAudioPlaybackUiState,
	setAudioTaskState,
	showAudioError
} from "./audioUiState.js";
import {
	activeAudioService,
	buildAudioRequest,
	buildAudioSignature
} from "./audioSynthesisRequest.js";
import { tryStreamToAudioPlayer } from "./audioStreamPlayback.js";

/**
 * The Awtsmoos opens an audible river without duplicating it. Awtsmoos.com
 * gives preparation its own task channel until the player becomes real, then
 * playback may speak without overwriting any separate save operation.
 */
export async function synthesizeForPlay(context, settings) {
	const { root, aiHandler } = context;
	const signature = buildAudioSignature(context, settings, "mp3");
	const existing = root.__awtsmoosAudio;
	if (existing?.signature === signature && existing.mode !== "idle") {
		await reusePlayer(root, existing);
		return;
	}
	try {
		resetAudioState(root);
		setAudioBusy(root, true, { allowDownload: true });
		setAudioTaskState(root, "play", "preparing", {
			message: "Preparing audio for playback…",
			progress: { received: 0, expected: 0 }
		});
		const service = await activeAudioService(aiHandler);
		const request = buildAudioRequest(context, settings, "mp3", signature);
		if (await tryStreamToAudioPlayer(root, service, request)) {
			return;
		}
		setAudioTaskState(root, "play", "preparing", {
			message: "Streaming is unavailable here; preparing the complete MP3…",
			progress: { received: 0, expected: 0 }
		});
		const result = await service.getAwtsmoosAudio({ ...request, download: false });
		await loadBlobAudioPlayer(root, result, signature);
	} catch (error) {
		const playButton = root.querySelector(".player-play");
		if (playButton) {
			playButton.disabled = true;
		}
		showAudioError(root, `Audio failed: ${error?.message || error}`, "play");
	} finally {
		setAudioBusy(root, false);
	}
}

async function reusePlayer(root, existing) {
	setAudioPlayerAvailable(root, true);
	if (existing.done) {
		setAudioPlaybackUiState(root, "ready", {
			message: "Audio is ready to play."
		});
	} else {
		setAudioTaskState(root, "stream", "streaming", {
			message: "The live audio stream is already running.",
			progress: {
				received: existing.bytes,
				expected: existing.expectedBytes
			}
		});
	}
	const playButton = root.querySelector(".player-play");
	if (playButton) {
		playButton.disabled = false;
	}
	await root.querySelector("audio")?.play?.().catch(() => undefined);
}
