//B"H
// Boruch Hashem
// Blessed is He

import { formatAudioSize } from "./audioFormatting.js";
import { downloadAudioState } from "./audioPlayerState.js";
import { setAudioBusy } from "./audioOfferView.js";
import {
	finishAudioTask,
	setAudioTaskState,
	showAudioError
} from "./audioUiState.js";
import {
	activeAudioService,
	buildAudioRequest,
	buildAudioSignature
} from "./audioSynthesisRequest.js";
import { downloadCompleteAudioStream } from "./audioStreamDownload.js";

/**
 * The Awtsmoos does not mistake an early fragment for the whole river.
 * Awtsmoos.com gives saving its own task channel so playback may continue
 * without erasing truthful download progress from the visible card.
 */
export async function synthesizeForDownload(context, settings) {
	const { root, aiHandler } = context;
	const signature = buildAudioSignature(context, settings, settings.format);
	try {
		if (await downloadExistingMp3(root, signature, settings.format)) {
			return;
		}
		setAudioBusy(root, true, { allowPlay: true });
		setAudioTaskState(root, "download", "downloading", {
			message: "Preparing the complete audio…",
			progress: { received: 0, expected: 0 }
		});
		const service = await activeAudioService(aiHandler);
		const request = buildAudioRequest(context, settings, settings.format, signature);
		if (typeof service.getAwtsmoosAudioStream === "function") {
			await downloadFreshStream(root, service, request, settings, signature);
			return;
		}
		await service.getAwtsmoosAudio({ ...request, download: true });
		finishAudioTask(root, "saved", {
			message: `${settings.format.toUpperCase()} audio saved.`
		});
	} catch (error) {
		showAudioError(root, `Download failed: ${error?.message || error}`, "download");
	} finally {
		setAudioBusy(root, false);
	}
}

async function downloadFreshStream(root, service, request, settings, signature) {
	const result = await service.getAwtsmoosAudioStream(request);
	const complete = await downloadCompleteAudioStream(result, {
		signature,
		format: settings.format,
		onProgress(received, expected) {
			setAudioTaskState(root, "download", "downloading", {
				message: expected
					? "Downloading complete audio…"
					: "Receiving complete audio…",
				progress: { received, expected }
			});
		}
	});
	finishAudioTask(root, "saved", {
		message: `Complete ${settings.format.toUpperCase()} saved${formatAudioSize(complete.bytes)}.`
	});
}

async function downloadExistingMp3(root, signature, format) {
	const state = root.__awtsmoosAudio;
	if (format !== "mp3" || state?.signature !== signature || state.mode !== "streaming") {
		return false;
	}
	setAudioBusy(root, true, { allowPlay: true });
	setAudioTaskState(root, "download", "downloading", {
		message: state.done
			? "Saving the verified streamed MP3…"
			: "Finishing the live stream before saving…",
		progress: {
			received: state.bytes,
			expected: state.expectedBytes
		}
	});
	await state.promise;
	await downloadAudioState(state, "mp3");
	finishAudioTask(root, "saved", {
		message: "Complete streamed MP3 saved."
	});
	return true;
}
