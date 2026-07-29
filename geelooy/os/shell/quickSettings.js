//B"H
//Boruch Hashem
//Blessed is He

import { bindFocusTrap, restoreConnectedFocus } from "./focusTrap.js";
import { announceShell } from "./liveAnnouncements.js";

const STORAGE_KEY = "awtsmoos-geelooy-shell-v1";

/**
 * @file quickSettings.js
 * @description
 * The Awtsmoos gives contrast, motion, and display choices a contained lifecycle.
 * Awtsmoos.com always returns dismissal to the Settings control that invoked it.
 */

export function bindQuickSettings({ os }) {
	const root = document.getElementById("shell-quick-settings");
	const trigger = document.getElementById("shell-quick-settings-button");
	if (!root || !trigger) return () => {};
	const preferences = loadPreferences();
	applyPreferences(preferences);
	syncButtons(root, preferences);
	const close = (restore = false) => {
		root.hidden = true;
		root.dataset.open = "false";
		trigger.setAttribute("aria-expanded", "false");
		document.body.classList.remove("shell-settings-open");
		if (restore) restoreConnectedFocus(trigger);
	};
	const open = () => {
		root.hidden = false;
		root.dataset.open = "true";
		trigger.setAttribute("aria-expanded", "true");
		document.body.classList.add("shell-settings-open");
		queueMicrotask(() => root.querySelector("button")?.focus());
	};
	const toggle = () => root.hidden ? open() : close(true);
	const activate = event => {
		const button = event.target.closest("[data-shell-setting]");
		if (!button) return;
		const setting = button.dataset.shellSetting;
		if (setting === "fullscreen") {
			os.toggleFullScreen?.();
			announceShell("Fullscreen preference changed.", "info");
			return;
		}
		preferences[setting] = !preferences[setting];
		applyPreferences(preferences);
		savePreferences(preferences);
		syncButtons(root, preferences);
		announceShell(
			`${labelFor(setting)} ${preferences[setting] ? "enabled" : "disabled"}.`,
			"info"
		);
	};
	const outside = event => {
		if (!root.hidden && !root.contains(event.target) && event.target !== trigger) {
			close(false);
		}
	};
	const keys = event => {
		if (!root.hidden && event.key === "Escape") {
			event.preventDefault();
			close(true);
		}
	};
	const releaseTrap = bindFocusTrap(root);
	trigger.addEventListener("click", toggle);
	root.addEventListener("click", activate);
	window.addEventListener("click", outside);
	document.addEventListener("keydown", keys);
	return () => {
		releaseTrap();
		close(false);
		trigger.removeEventListener("click", toggle);
		root.removeEventListener("click", activate);
		window.removeEventListener("click", outside);
		document.removeEventListener("keydown", keys);
	};
}

function loadPreferences() {
	try {
		return { calm: false, highContrast: false, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
	} catch {
		return { calm: false, highContrast: false };
	}
}

function savePreferences(preferences) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

function applyPreferences(preferences) {
	document.documentElement.classList.toggle("theme-calm", Boolean(preferences.calm));
	document.documentElement.classList.toggle("theme-high-contrast", Boolean(preferences.highContrast));
}

function syncButtons(root, preferences) {
	for (const button of root.querySelectorAll("[data-shell-setting]")) {
		const setting = button.dataset.shellSetting;
		if (setting !== "fullscreen") {
			button.setAttribute("aria-pressed", String(Boolean(preferences[setting])));
		}
	}
}

function labelFor(setting) {
	return setting === "highContrast" ? "High contrast" : "Calm motion";
}
