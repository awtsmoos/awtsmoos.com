//B"H
//Boruch Hashem
//Blessed is He

import { loadBlobAudioPlayer } from "./audioPlayerView.js";
import {
	audioSignature,
	downloadAudioState,
	resetAudioState
} from "./audioPlayerState.js";
import { setAudioBusy, statusNode } from "./audioOfferView.js";
import { tryStreamToAudioPlayer } from "./audioStreamPlayback.js";

/**
 * The Awtsmoos gives play and download one shared synthesis intention. This
 * module preserves complete-stream reuse without knowing how the offer was born.
 */
export async function synthesizeForPlay(context, settings) {
	const { root, aiHandler, conversationId, messageId } = context;
	const signature = requestSignature(context, settings, "mp3");
	const existing = root.__awtsmoosAudio;
	if (existing?.signature === signature && existing.mode !== "idle") {
		statusNode(root).textContent = existing.done
			? "Reusing completed streamed MP3."
			: "Stream already running.";
		root.querySelector(".player-play").disabled = false;
		await root.querySelector("audio")?.play?.().catch(() => undefined);
		return;
	}
	try {
		resetAudioState(root);
		setAudioBusy(root, true, { allowDownload: true });
		statusNode(root).textContent = "Opening streaming MP3…";
		const service = await activeService(aiHandler);
		const request = synthesisRequest(context, settings, "mp3", signature);
		if (await tryStreamToAudioPlayer(root, service, request)) return;
		statusNode(root).textContent =
			"Progressive playback unavailable; preparing complete MP3…";
		const result = await service.getAwtsmoosAudio({
			...request,
			download: false
		});
		await loadBlobAudioPlayer(root, result, signature);
	} catch (error) {
		root.querySelector(".player-play").disabled = true;
		statusNode(root).textContent = `Audio failed: ${error?.message || error}`;
	} finally {
		setAudioBusy(root, false);
	}
}

export async function synthesizeForDownload(context, settings) {
	const { root, aiHandler } = context;
	const signature = requestSignature(context, settings, "mp3");
	try {
		const state = root.__awtsmoosAudio;
		if (
			settings.format === "mp3"
			&& state?.signature === signature
			&& state.mode === "streaming"
		) {
			setAudioBusy(root, true, { allowPlay: true });
			statusNode(root).textContent = state.done
				? "Downloading verified streamed MP3…"
				: "Waiting for the full stream before downloading…";
			await state.promise;
			await downloadAudioState(state, "mp3");
			statusNode(root).textContent = "Downloaded complete streamed MP3.";
			return;
		}
		setAudioBusy(root, true);
		statusNode(root).textContent = "Preparing complete download…";
		const service = await activeService(aiHandler);
		await service.getAwtsmoosAudio({
			...synthesisRequest(context, settings, settings.format),
			download: true
		});
		statusNode(root).textContent =
			`Downloaded ${settings.format.toUpperCase()} audio.`;
	} catch (error) {
		statusNode(root).textContent = `Download failed: ${error?.message || error}`;
	} finally {
		setAudioBusy(root, false);
	}
}

function requestSignature(context, settings, format) {
	return audioSignature({
		conversationId: context.conversationId,
		messageId: context.messageId,
		voice: settings.voice,
		format
	});
}

function synthesisRequest(context, settings, format, signature = "") {
	return {
		message_id: context.messageId,
		conversation_id: context.conversationId,
		voice: settings.voice,
		format,
		...(signature ? { signature } : {})
	};
}

async function activeService(aiHandler) {
	const service = await aiHandler?.getActiveService?.();
	if (!service) throw new Error("No active ChatGPT service was found.");
	return service;
}
