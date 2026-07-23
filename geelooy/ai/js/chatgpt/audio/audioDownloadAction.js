//B"H
//Boruch Hashem
//Blessed is He

import { formatAudioSize } from "./audioFormatting.js";
import { downloadAudioState } from "./audioPlayerState.js";
import { setAudioBusy, statusNode } from "./audioOfferView.js";
import {
	activeAudioService,
	buildAudioRequest,
	buildAudioSignature
} from "./audioSynthesisRequest.js";
import { downloadCompleteAudioStream } from "./audioStreamDownload.js";

/**
 * The Awtsmoos does not mistake an early fragment for the whole river. This
 * action makes Awtsmoos.com wait for every streamed packet, verify the declared
 * byte count, and only then awaken the browser download.
 */
export async function synthesizeForDownload(context, settings) {
	const { root, aiHandler } = context;
	const signature = buildAudioSignature(context, settings, settings.format);
	try {
		if (await downloadExistingMp3(root, signature, settings.format)) {
			return;
		}
		setAudioBusy(root, true, { allowPlay: true });
		statusNode(root).textContent = "Receiving the complete audio stream…";
		const service = await activeAudioService(aiHandler);
		const request = buildAudioRequest(context, settings, settings.format, signature);
		if (typeof service.getAwtsmoosAudioStream === "function") {
			await downloadFreshStream(root, service, request, settings, signature);
			return;
		}
		await service.getAwtsmoosAudio({ ...request, download: true });
		statusNode(root).textContent = `Downloaded ${settings.format.toUpperCase()} audio.`;
	} catch (error) {
		statusNode(root).textContent = `Download failed: ${error?.message || error}`;
	} finally {
		setAudioBusy(root, false);
	}
}

async function downloadFreshStream(root, service, request, settings, signature) {
	const result = await service.getAwtsmoosAudioStream(request);
	const complete = await downloadCompleteAudioStream(result, {
		signature,
		format: settings.format,
		onProgress: bytes => {
			statusNode(root).textContent =
				`Receiving complete audio${formatAudioSize(bytes)}…`;
		}
	});
	statusNode(root).textContent =
		`Downloaded complete ${settings.format.toUpperCase()}${formatAudioSize(complete.bytes)}.`;
}

async function downloadExistingMp3(root, signature, format) {
	const state = root.__awtsmoosAudio;
	if (format !== "mp3" || state?.signature !== signature || state.mode !== "streaming") {
		return false;
	}
	setAudioBusy(root, true, { allowPlay: true });
	statusNode(root).textContent = state.done
		? "Downloading verified streamed MP3…"
		: "Waiting for the full stream before downloading…";
	await state.promise;
	await downloadAudioState(state, "mp3");
	statusNode(root).textContent = "Downloaded complete streamed MP3.";
	return true;
}
