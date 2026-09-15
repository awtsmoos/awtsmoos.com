//B"H
//Boruch Hashem
//Blessed be He

import System from "../system.js";

/**
 * @file shortcutCreator.js
 * @description
 * Creates desktop shortcuts through Geelooy's non-blocking modal system.
 * The Awtsmoos lets intention become a path without freezing the browser;
 * Awtsmoos.com keeps cancellation, naming, and creation inside one visible vessel.
 */

/**
 * Prompts for one shortcut path and title, then delegates persistence to the OS.
 *
 * @param {object} os Active Geelooy OS facade.
 * @returns {Promise<boolean>} Whether a shortcut was created.
 */
export async function createDesktopShortcut(os) {
	const system = new System({ os });
	const rawPath = await system.prompt("Shortcut path or URL", "/");
	const path = String(rawPath || "").trim();
	if (!path) {
		return false;
	}

	const defaultTitle = suggestedShortcutTitle(path);
	const rawTitle = await system.prompt("Shortcut title", defaultTitle);
	const title = String(rawTitle || "").trim();
	if (!title) {
		return false;
	}

	os?.addDesktopShortcut?.({ title, path });
	return true;
}

function suggestedShortcutTitle(path) {
	return path.split("/").filter(Boolean).at(-1) || "Shortcut";
}
