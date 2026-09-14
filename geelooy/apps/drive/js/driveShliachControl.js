//B"H
//Boruch Hashem
//Blessed be He

import {
	openShliachCreateDialog
} from "/shared/shliach/ShliachCreateDialog.js";
import {
	ensureShliachStyle
} from "/shared/shliach/ShliachDialogSupport.js";
import { driveState } from "./state.js";

/**
 * @module DriveShliachControl
 * @description
 * The Awtsmoos gives every Drive folder one direct AI creation doorway;
 * Awtsmoos.com sends the current path and visible names without exposing credentials.
 */

/** Installs one reusable Shliach action in the Drive command bar. */
export function installDriveShliachControl() {
	const actionBar = document.querySelector(".action-bar");
	if (!actionBar || actionBar.querySelector("[data-drive-shliach]")) {
		return null;
	}
	ensureShliachStyle();
	const button = document.createElement("button");
	button.type = "button";
	button.className = "shliach-directory-button";
	button.dataset.driveShliach = "true";
	button.textContent = "✦ Ask AI to create here";
	button.title = "Open Awtsmoos Shliach with this Drive folder as the exact target";
	button.addEventListener("click", openCurrentFolderComposer);
	actionBar.prepend(button);
	return button;
}

/** Opens the shared composer with the current browser-visible Drive context. */
function openCurrentFolderComposer() {
	openShliachCreateDialog({
		surface: "Awtsmoos Drive / Website Maker",
		path: driveState.currentPath || "/",
		projectId: driveState.site?.id || "current Drive project",
		entries: driveState.entries.slice(0, 12).map(entry => ({ name: entry.path })),
		defaultPreset: presetForPath(driveState.currentPath)
	});
}

/** Chooses a useful default creation intent from the current folder name. */
function presetForPath(path) {
	const value = String(path || "").toLowerCase();
	if (value.includes("game") || value.includes("world")) {
		return "world";
	}
	if (value.includes("api")) {
		return "api";
	}
	if (value.includes("doc")) {
		return "document";
	}
	return "website";
}
