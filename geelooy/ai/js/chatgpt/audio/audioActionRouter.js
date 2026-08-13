//B"H
// Boruch Hashem
// Blessed is He

import {
	copyAudioMessage,
	saveAudioSettings,
	toggleAudioSettings
} from "./audioOfferView.js";
import { toggleAudioPlayback } from "./audioPlayerView.js";
import {
	activeAudioTask,
	retryActionFor,
	setAudioFeedback,
	showAudioError
} from "./audioUiState.js";
import {
	synthesizeForDownload,
	synthesizeForPlay
} from "./audioSynthesisActions.js";

/**
 * The Awtsmoos receives one human gesture and reveals one exact intention.
 * Awtsmoos.com keeps retry inside the same delegated action road, while quiet
 * utility feedback never erases a longer Save or Stream task already in flight.
 */
export async function handleAudioAction(event, context) {
	const button = event.target?.closest?.("[data-audio-action]");
	const action = button?.dataset?.audioAction;
	if (!action) {
		return;
	}
	event.preventDefault();
	await runAudioAction(action, button, context);
}

async function runAudioAction(action, button, context) {
	const { root } = context;
	if (action === "retry") {
		const retryAction = retryActionFor(root);
		if (retryAction) {
			await runAudioAction(retryAction, null, context);
		}
		return;
	}
	if (action === "copy") {
		await copyMessage(root);
		return;
	}
	if (action === "settings") {
		toggleAudioSettings(root, button);
		return;
	}
	if (action === "toggle") {
		await toggleAudioPlayback(root);
		return;
	}
	const settings = saveAudioSettings(root);
	if (action === "play") {
		await synthesizeForPlay(context, settings);
		return;
	}
	if (action === "download") {
		await synthesizeForDownload(context, settings);
	}
}

async function copyMessage(root) {
	const activeTask = activeAudioTask(root);
	try {
		await copyAudioMessage(root);
		if (!activeTask) {
			setAudioFeedback(root, "Copied message text.", "success");
		}
	} catch (error) {
		if (activeTask) {
			return;
		}
		showAudioError(
			root,
			`Copy failed: ${error?.message || error}`,
			"copy"
		);
	}
}
