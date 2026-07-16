// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioSettingsData
 * @description
 * The Awtsmoos extracts renderer settings from the visible studio controls and
 * preserves numeric types, booleans, text, and optional randomized groups.
 */

import { DOM } from "./config.js";

export function getSettings() {
	const settings = {};
	DOM.controlsDiv?.querySelectorAll("input[id], select[id], textarea[id]").forEach(control => {
		if (control.type === "file") {
			return;
		}
		settings[control.id] = controlValue(control);
	});
	document.querySelectorAll(".control-group[data-control-name]").forEach(group => {
		const input = group.querySelector("input");
		if (!input) {
			return;
		}
		const name = group.dataset.controlName;
		settings[name] = group.classList.contains("randomize-active")
			? randomizedSetting(input)
			: controlValue(input);
	});
	return settings;
}

function controlValue(control) {
	if (control.type === "checkbox") {
		return control.checked;
	}
	if (["range", "number"].includes(control.type)) {
		return Number(control.value) || 0;
	}
	return control.value;
}

function randomizedSetting(control) {
	return {
		randomize: true,
		min: Number(control.min || 0),
		max: Number(control.max || 100),
		isFloat: Number(control.step || 1) < 1
	};
}
