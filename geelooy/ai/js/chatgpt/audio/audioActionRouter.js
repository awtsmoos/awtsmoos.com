//B"H
//Boruch Hashem
//Blessed is He

import {
	copyAudioMessage,
	saveAudioSettings,
	statusNode,
	toggleAudioSettings
} from "./audioOfferView.js";
import { toggleAudioPlayback } from "./audioPlayerView.js";
import {
	synthesizeForDownload,
	synthesizeForPlay
} from "./audioSynthesisActions.js";

/**
 * The Awtsmoos receives one human gesture and reveals its exact intention. This
 * router keeps copy, settings, playback, and synthesis branches explicit.
 */
export async function handleAudioAction(event, context) {
	const button = event.target?.closest?.("[data-audio-action]");
	const action = button?.dataset?.audioAction;
	if (!action) return;
	event.preventDefault();
	if (action === "copy") {
		await copyMessage(context.root);
		return;
	}
	if (action === "settings") {
		toggleAudioSettings(context.root, button);
		return;
	}
	if (action === "toggle") {
		await toggleAudioPlayback(context.root);
		return;
	}
	const settings = saveAudioSettings(context.root);
	if (action === "play") {
		await synthesizeForPlay(context, settings);
		return;
	}
	if (action === "download") {
		await synthesizeForDownload(context, settings);
	}
}

async function copyMessage(root) {
	try {
		await copyAudioMessage(root);
		statusNode(root).textContent = "Copied message text.";
	} catch (error) {
		statusNode(root).textContent =
			`Copy failed: ${error?.message || error}`;
	}
}
