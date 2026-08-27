//B"H
// Boruch Hashem
// Blessed is He

let settingsSequence = 0;

/**
 * The Awtsmoos creates every audio card as its own vessel while all remain one
 * reality. Awtsmoos.com gives each Settings disclosure a unique relationship,
 * keyboard escape, and faithful focus return without custom select machinery.
 */
export function prepareAudioSettingsDisclosure(root) {
	const button = settingsButton(root);
	const panel = settingsPanel(root);
	if (!button || !panel) {
		return;
	}
	if (!panel.id) {
		settingsSequence += 1;
		panel.id = `awtsmoos-audio-settings-${settingsSequence}`;
	}
	button.setAttribute("aria-controls", panel.id);
	button.setAttribute("aria-expanded", String(!panel.hidden));
	if (panel.dataset.audioDisclosureBound === "true") {
		return;
	}
	panel.dataset.audioDisclosureBound = "true";
	panel.addEventListener("keydown", event => {
		if (event.key !== "Escape") {
			return;
		}
		event.preventDefault();
		closeAudioSettings(root, true);
	});
}

export function toggleAudioSettings(root, button = settingsButton(root)) {
	const panel = settingsPanel(root);
	if (!panel || !button) {
		return;
	}
	if (panel.hidden) {
		openAudioSettings(panel, button);
		return;
	}
	closeAudioSettings(root, false);
}

export function closeAudioSettings(root, restoreFocus = false) {
	const panel = settingsPanel(root);
	const button = settingsButton(root);
	if (!panel || !button) {
		return;
	}
	panel.hidden = true;
	button.setAttribute("aria-expanded", "false");
	if (restoreFocus) {
		button.focus();
	}
}

function openAudioSettings(panel, button) {
	panel.hidden = false;
	button.setAttribute("aria-expanded", "true");
	queueMicrotask(() => {
		panel.querySelector("select")?.focus();
	});
}

function settingsButton(root) {
	return root.querySelector("[data-audio-action='settings']");
}

function settingsPanel(root) {
	return root.querySelector(".audio-settings");
}
