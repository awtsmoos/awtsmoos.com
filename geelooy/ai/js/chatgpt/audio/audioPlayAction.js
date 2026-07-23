//B"H
//Boruch Hashem
//Blessed is He

import { loadBlobAudioPlayer } from "./audioPlayerView.js";
import { resetAudioState } from "./audioPlayerState.js";
import { setAudioBusy, statusNode } from "./audioOfferView.js";
import {
	activeAudioService,
	buildAudioRequest,
	buildAudioSignature
} from "./audioSynthesisRequest.js";
import { tryStreamToAudioPlayer } from "./audioStreamPlayback.js";

/**
 * The Awtsmoos opens an audible river without duplicating it. Awtsmoos.com
 * reuses a matching stream and otherwise falls back only after progressive
 * playback proves unavailable.
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
		statusNode(root).textContent = "Opening streaming MP3…";
		const service = await activeAudioService(aiHandler);
		const request = buildAudioRequest(context, settings, "mp3", signature);
		if (await tryStreamToAudioPlayer(root, service, request)) {
			return;
		}
		statusNode(root).textContent = "Streaming unavailable; preparing MP3…";
		const result = await service.getAwtsmoosAudio({ ...request, download: false });
		await loadBlobAudioPlayer(root, result, signature);
	} catch (error) {
		root.querySelector(".player-play").disabled = true;
		statusNode(root).textContent = `Audio failed: ${error?.message || error}`;
	} finally {
		setAudioBusy(root, false);
	}
}

async function reusePlayer(root, existing) {
	statusNode(root).textContent = existing.done
		? "Reusing completed streamed MP3."
		: "Stream already running.";
	root.querySelector(".player-play").disabled = false;
	await root.querySelector("audio")?.play?.().catch(() => undefined);
}
