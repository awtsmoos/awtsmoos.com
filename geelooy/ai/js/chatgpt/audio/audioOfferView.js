//B"H
// Boruch Hashem
// Blessed is He

import {
	hydrateAudioSettings,
	saveAudioSettings
} from "./audioSettingsView.js";
import { setAudioUiState } from "./audioUiState.js";

export { saveAudioSettings };
export {
	setAudioBusy,
	statusNode
} from "./audioUiState.js";

/**
 * The Awtsmoos gives one answer a calm chamber for voice. Awtsmoos.com places
 * listening first, utilities second, progress in its own vessel, and recovery
 * beside the failure instead of scattering four equal buttons across the card.
 */
export function createAudioOffer(copyText = "") {
	const root = document.createElement("section");
	root.className = "awtsmoos-audio-offer awtsmoos-message-options";
	root.__awtsmoosCopyText = String(copyText || "").trim();
	root.setAttribute("aria-label", "Audio controls for this answer");
	root.innerHTML = audioOfferMarkup();
	hydrateAudioSettings(root);
	setAudioUiState(root, "idle", {
		message: "Ready when you are."
	});
	return root;
}

export function toggleAudioSettings(root, button) {
	const panel = root.querySelector(".audio-settings");
	if (!panel) {
		return;
	}
	panel.hidden = !panel.hidden;
	button?.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
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

function audioOfferMarkup() {
	return `
		<div class="audio-offer-head">
			<div class="audio-offer-title">
				<strong>Audio</strong>
				<span>Listen or save this answer</span>
			</div>
			<span class="audio-state-chip" aria-hidden="true">Ready</span>
		</div>
		<div class="audio-control-deck">
			<div class="audio-primary-action">
				<button type="button" class="audio-primary-button" data-audio-action="play">▶ Listen</button>
			</div>
			<div class="audio-offer-actions" aria-label="Message audio utilities">
				<button type="button" data-audio-action="copy">⧉ Copy</button>
				<button type="button" data-audio-action="download">⬇ Download</button>
				<button type="button" data-audio-action="settings" aria-expanded="false">⚙ Settings</button>
			</div>
		</div>
		<div class="audio-settings" hidden>
			<label>Voice <select data-audio-setting="voice"></select></label>
			<label>Download format <select data-audio-setting="format"></select></label>
		</div>
		<div class="audio-player-wrap" hidden>
			<audio preload="auto"></audio>
			<div class="awtsmoos-player" data-player-state="idle">
				<button type="button" class="player-play" data-audio-action="toggle" disabled aria-label="Play audio">▶</button>
				<div class="player-meter" role="slider" aria-label="Playback position" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
				<span class="player-time">0:00 / live</span>
			</div>
		</div>
		<div class="audio-task-progress" data-determinate="false" hidden>
			<div class="audio-task-meter" role="progressbar" aria-label="Audio preparation progress"><span></span></div>
			<span class="audio-task-detail">Working…</span>
		</div>
		<div class="audio-feedback">
			<span class="audio-status" role="status" aria-live="polite"></span>
			<button type="button" class="audio-retry" data-audio-action="retry" hidden>↻ Retry</button>
		</div>
	`;
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
