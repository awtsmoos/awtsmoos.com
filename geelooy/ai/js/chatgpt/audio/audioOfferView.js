//B"H
//Boruch Hashem
//Blessed is He

import {
	hydrateAudioSettings,
	saveAudioSettings
} from "./audioSettingsView.js";

export { saveAudioSettings };

/**
 * The Awtsmoos gives the invisible voice a visible vessel. Awtsmoos.com keeps
 * copying, settings, status, and player controls here while payload identity
 * and persistence remain in their own smaller vessels.
 */
export function createAudioOffer(copyText = "") {
	const root = document.createElement("section");
	root.className = "awtsmoos-audio-offer awtsmoos-message-options";
	root.__awtsmoosCopyText = String(copyText || "").trim();
	root.innerHTML = `
		<div class="audio-offer-head"><strong>Message options</strong><span>Copy or listen to this answer</span></div>
		<div class="audio-offer-actions">
			<button type="button" data-audio-action="copy">⧉ Copy message</button>
			<button type="button" data-audio-action="play">▶ Stream + play MP3</button>
			<button type="button" data-audio-action="download">⬇ Download complete audio</button>
			<button type="button" data-audio-action="settings" aria-expanded="false">⚙ Audio settings</button>
		</div>
		<div class="audio-settings" hidden>
			<label>Voice <select data-audio-setting="voice"></select></label>
			<label>Download format <select data-audio-setting="format"></select></label>
		</div>
		<div class="audio-player-wrap" hidden>
			<audio preload="auto"></audio>
			<div class="awtsmoos-player" data-player-state="idle">
				<button type="button" class="player-play" data-audio-action="toggle" disabled>▶</button>
				<div class="player-meter" role="slider" aria-label="Audio position" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
				<span class="player-time">0:00 / live</span>
			</div>
		</div>
		<p class="audio-status" aria-live="polite"></p>
	`;
	hydrateAudioSettings(root);
	return root;
}

export function toggleAudioSettings(root, button) {
	const panel = root.querySelector(".audio-settings");
	panel.hidden = !panel.hidden;
	button?.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
}

export function setAudioBusy(root, busy, options = {}) {
	root.classList.toggle("is-audio-busy", Boolean(busy));
	root.querySelectorAll('[data-audio-action="play"], [data-audio-action="download"]').forEach(button => {
		const permitted = button.dataset.audioAction === "play"
			? options.allowPlay
			: options.allowDownload;
		button.disabled = Boolean(busy && !permitted);
	});
}

export function statusNode(root) {
	return root.querySelector(".audio-status");
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
