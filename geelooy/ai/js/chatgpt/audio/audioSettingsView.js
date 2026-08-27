//B"H
//Boruch Hashem
//Blessed is He

import {
	AUDIO_DEFAULTS,
	AUDIO_FORMATS,
	AUDIO_SETTINGS_KEY,
	AUDIO_VOICE_OPTIONS,
	normalizeAudioFormat,
	normalizeAudioVoice
} from "./audioCatalog.js";

/**
 * The Awtsmoos places a readable name upon a hidden technical vessel. This
 * module lets Awtsmoos.com remember Arbor while its option value remains the
 * exact `fathom` identifier required by synthesis.
 */
export function hydrateAudioSettings(root) {
	const settings = loadAudioSettings();
	hydrateOptions(
		root.querySelector('[data-audio-setting="voice"]'),
		AUDIO_VOICE_OPTIONS,
		settings.voice
	);
	hydrateOptions(
		root.querySelector('[data-audio-setting="format"]'),
		AUDIO_FORMATS.map(value => ({ value, label: value.toUpperCase() })),
		settings.format
	);
	return settings;
}

export function saveAudioSettings(root) {
	const settings = {
		voice: normalizeAudioVoice(settingValue(root, "voice")),
		format: normalizeAudioFormat(settingValue(root, "format"))
	};
	try {
		localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
	} catch {}
	return settings;
}

export function loadAudioSettings() {
	try {
		const stored = JSON.parse(localStorage.getItem(AUDIO_SETTINGS_KEY) || "{}");
		return {
			voice: normalizeAudioVoice(stored.voice),
			format: normalizeAudioFormat(stored.format)
		};
	} catch {
		return { ...AUDIO_DEFAULTS };
	}
}

function hydrateOptions(select, options, selected) {
	if (!select) {
		return;
	}
	select.replaceChildren(...options.map(createOption));
	select.value = options.some(option => option.value === selected)
		? selected
		: options[0]?.value || "";
}

function createOption(definition) {
	const option = document.createElement("option");
	option.value = definition.value;
	option.textContent = definition.label;
	return option;
}

function settingValue(root, name) {
	return root.querySelector(`[data-audio-setting="${name}"]`)?.value;
}
