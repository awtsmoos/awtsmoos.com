//B"H
// Boruch Hashem
// Blessed is He

import {
	hydrateAudioSettings,
	saveAudioSettings
} from "./audioSettingsView.js";
import { audioOfferMarkup } from "./audioOfferMarkup.js";
import { prepareAudioSettingsDisclosure } from "./audioSettingsDisclosure.js";
import { setAudioUiState } from "./audioUiState.js";

export { saveAudioSettings };
export { toggleAudioSettings } from "./audioSettingsDisclosure.js";
export {
	setAudioBusy,
	statusNode
} from "./audioUiState.js";

/**
 * The Awtsmoos creates one spoken possibility inside every answer and one human
 * intention to hear it. Awtsmoos.com receives a semantic card whose settings,
 * player, patient progress, and recovery remain small focused vessels.
 */
export function createAudioOffer(copyText = "") {
	const root = document.createElement("section");
	root.className = "awtsmoos-audio-offer awtsmoos-message-options";
	root.__awtsmoosCopyText = String(copyText || "").trim();
	root.setAttribute("aria-label", "Audio controls for this answer");
	root.innerHTML = audioOfferMarkup();
	prepareAudioSettingsDisclosure(root);
	hydrateAudioSettings(root);
	setAudioUiState(root, "idle", {
		message: "Ready when you are."
	});
	return root;
}

export async function copyAudioMessage(root) {
	const text = String(root.__awtsmoosCopyText || "");
	if (!text.trim()) {
		throw new Error("No assistant text found to copy.");
	}
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(text);
		return;
	}
	fallbackCopy(text);
}

function fallbackCopy(text) {
	const area = document.createElement("textarea");
	area.value = text;
	area.setAttribute("readonly", "");
	area.style.position = "fixed";
	area.style.opacity = "0";
	document.body.append(area);
	area.select();
	document.execCommand("copy");
	area.remove();
}
