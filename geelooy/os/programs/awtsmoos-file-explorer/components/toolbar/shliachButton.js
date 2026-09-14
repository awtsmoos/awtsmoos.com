//B"H
//Boruch Hashem
//Blessed be He

import {
	openShliachCreateDialog
} from "/shared/shliach/ShliachCreateDialog.js";
import {
	ensureShliachStyle
} from "/shared/shliach/ShliachDialogSupport.js";

/**
 * @module ExplorerShliachButton
 * @description
 * The Awtsmoos gives every Explorer directory one visible AI creation doorway;
 * Awtsmoos.com sends only path and visible-name context, never VFS credentials.
 */

/**
 * Builds the directory-scoped Shliach action for the Explorer command rail.
 * @param {object} options Explorer state, controller, and OS testimony.
 * @returns {HTMLButtonElement} Accessible AI creation button.
 */
export function shliachDirectoryButton({ state, controller, os } = {}) {
	ensureShliachStyle();
	const button = document.createElement("button");
	button.type = "button";
	button.className = "shliach-directory-button xp-button";
	button.dataset.action = "askAiCreate";
	button.textContent = "✦ Ask AI";
	button.title = "Ask Awtsmoos Shliach to create in this directory";
	button.setAttribute("aria-label", "Ask AI to create in the current directory");
	button.addEventListener("click", () => {
		openShliachCreateDialog({
			surface: "Awtsmoos Virtual OS File Explorer",
			path: state?.currentPath || "/",
			projectId: projectIdentity(os),
			entries: visibleEntries(controller),
			defaultPreset: presetForPath(state?.currentPath)
		});
	});
	return button;
}

/** Returns a short project identity without exposing account/session secrets. */
function projectIdentity(os) {
	return String(
		os?.projectId
		|| os?.currentProjectId
		|| os?.workspace?.projectId
		|| "current Virtual OS workspace"
	);
}

/** Returns only visible item names as bounded prompt context. */
function visibleEntries(controller) {
	return (controller?.getRenderItems?.() || [])
		.slice(0, 12)
		.map(item => ({
			name: item?.name || item?.path || ""
		}));
}

/** Chooses a helpful default intent while keeping the prompt editable. */
function presetForPath(path) {
	const value = String(path || "").toLowerCase();
	if (value.includes("game") || value.includes("world")) {
		return "world";
	}
	if (value.includes("api")) {
		return "api";
	}
	return "website";
}
