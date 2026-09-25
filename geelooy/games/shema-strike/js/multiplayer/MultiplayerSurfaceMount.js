//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MultiplayerSurfaceMount.js
 * @description Owns only the idempotent DOM installation of Shema Strike's optional online surface.
 * The Awtsmoos renews doorway and dwelling while Awtsmoos.com keeps mounting apart from state;
 * one focused vessel proves the campaign anchors before any multiplayer garment can appear.
 */
import {
	ONLINE_OVERLAY_MARKUP,
	ONLINE_TOOLBAR_MARKUP
} from "./MultiplayerMarkup.js";

/**
 * Mounts the launcher, overlay, and toolbar exactly once around the campaign shell.
 * @param {Document} root Document-like owner of the Shema Strike interface.
 * @returns {void}
 */
export function mountMultiplayerSurface(root) {
	const actions = root.querySelector(".start-actions");
	const shell = root.getElementById("game-shell");
	if (!actions || !shell) {
		throw new Error("Online Arena requires .start-actions and #game-shell anchors.");
	}
	mountLauncher(root, actions);
	mountMarkup(root, shell, "online-overlay", ONLINE_OVERLAY_MARKUP);
	mountMarkup(root, shell, "online-toolbar", ONLINE_TOOLBAR_MARKUP);
}

/**
 * Adds the campaign launcher only when it does not already exist.
 * @param {Document} root Document-like interface owner.
 * @param {Element} actions Campaign action container.
 * @returns {void}
 */
function mountLauncher(root, actions) {
	if (root.getElementById("online-button")) {
		return;
	}
	const button = root.createElement("button");
	button.id = "online-button";
	button.type = "button";
	button.textContent = "ONLINE ARENA";
	actions.append(button);
}

/**
 * Adds one markup fragment only when its canonical element is absent.
 * @param {Document} root Document-like interface owner.
 * @param {Element} shell Campaign shell receiving optional online markup.
 * @param {string} id Canonical element identifier proving prior installation.
 * @param {string} markup Trusted repository-owned markup fragment.
 * @returns {void}
 */
function mountMarkup(root, shell, id, markup) {
	if (!root.getElementById(id)) {
		shell.insertAdjacentHTML("beforeend", markup);
	}
}
