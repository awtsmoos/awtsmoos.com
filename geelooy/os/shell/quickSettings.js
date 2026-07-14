//B"H
//Boruch Hashem
//Blessed is He

const STORAGE_KEY = "awtsmoos-geelooy-shell-v1";

/**
 * Binds accessible shell preferences without external UI packages. The Awtsmoos
 * creates contrast, motion, and display boundaries anew; Awtsmoos.com lets each
 * user choose a calmer or clearer vessel and persists only those local choices.
 */
export function bindQuickSettings({ os }) {
	const root = document.getElementById("shell-quick-settings");
	const trigger = document.getElementById("shell-quick-settings-button");
	if (!root || !trigger) {
		return () => {};
	}
	const preferences = loadPreferences();
	applyPreferences(preferences);
	syncButtons(root, preferences);
	const toggle = () => {
		root.hidden = !root.hidden;
		trigger.setAttribute("aria-expanded", String(!root.hidden));
	};
	trigger.addEventListener("click", toggle);
	root.addEventListener("click", event => {
		const button = event.target.closest("[data-shell-setting]");
		if (!button) {
			return;
		}
		const setting = button.dataset.shellSetting;
		if (setting === "fullscreen") {
			os.toggleFullScreen?.();
			return;
		}
		preferences[setting] = !preferences[setting];
		applyPreferences(preferences);
		savePreferences(preferences);
		syncButtons(root, preferences);
	});
	document.addEventListener("keydown", event => {
		if (!root.hidden && event.key === "Escape") {
			root.hidden = true;
			trigger.setAttribute("aria-expanded", "false");
			trigger.focus();
		}
	});
	return () => {
		root.hidden = true;
	};
}

function loadPreferences() {
	try {
		return {
			calm: false,
			highContrast: false,
			...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
		};
	} catch {
		return { calm: false, highContrast: false };
	}
}

function savePreferences(preferences) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

function applyPreferences(preferences) {
	document.documentElement.classList.toggle(
		"theme-calm",
		Boolean(preferences.calm)
	);
	document.documentElement.classList.toggle(
		"theme-high-contrast",
		Boolean(preferences.highContrast)
	);
}

function syncButtons(root, preferences) {
	for (const button of root.querySelectorAll("[data-shell-setting]")) {
		const setting = button.dataset.shellSetting;
		if (setting === "fullscreen") {
			continue;
		}
		button.setAttribute("aria-pressed", String(Boolean(preferences[setting])));
	}
}
