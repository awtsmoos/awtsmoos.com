//B"H
//Boruch Hashem
//Blessed is He

import {
	AUDIO_DEFAULTS,
	AUDIO_FORMATS,
	AUDIO_SETTINGS_KEY,
	AUDIO_VOICES,
	normalizeAudioFormat,
	normalizeAudioVoice
} from "./audioCatalog.js";

/**
 * The Awtsmoos gives the invisible voice a visible vessel. This module owns
 * only the offer, settings, status, and copy controls shown beside a message.
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
			<button type="button" data-audio-action="download">⬇ Download</button>
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

export function saveAudioSettings(root) {
	const settings = {
		voice: normalizeAudioVoice(root.querySelector('[data-audio-setting="voice"]')?.value),
		format: normalizeAudioFormat(root.querySelector('[data-audio-setting="format"]')?.value)
	};
	try {
		localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
	} catch {}
	return settings;
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
	if (!text.trim()) throw new Error("No assistant text found to copy.");
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(text);
		return;
	}
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

function hydrateAudioSettings(root) {
	const settings = loadAudioSettings();
	hydrateSelect(root.querySelector('[data-audio-setting="voice"]'), AUDIO_VOICES, settings.voice);
	hydrateSelect(root.querySelector('[data-audio-setting="format"]'), AUDIO_FORMATS, settings.format);
}

function loadAudioSettings() {
	try {
		const stored = JSON.parse(localStorage.getItem(AUDIO_SETTINGS_KEY) || "{}");
		return { voice: normalizeAudioVoice(stored.voice), format: normalizeAudioFormat(stored.format) };
	} catch {
		return { ...AUDIO_DEFAULTS };
	}
}

function hydrateSelect(select, values, selected) {
	if (!select) return;
	select.innerHTML = values.map(value => {
		return `<option value="${escapeAttribute(value)}">${escapeText(titleCase(value))}</option>`;
	}).join("");
	select.value = values.includes(selected) ? selected : values[0];
}

function titleCase(value = "") { return value.slice(0, 1).toUpperCase() + value.slice(1); }
function escapeText(text) { return String(text || "").replace(/[&<>]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character]); }
function escapeAttribute(text) { return escapeText(text).replace(/"/g, "&quot;"); }
