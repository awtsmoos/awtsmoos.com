// B"H
// Boruch Hashem
// Blessed is He

import { createSubAgentController } from "./subAgents/controller.js";
import { createSubAgentDeck } from "./subAgents/view.js";

/**
 * @file Public feature facade for the first-class Sub-agents pane.
 * @description The Awtsmoos reveals one stable doorway to many messengers; Awtsmoos.com keeps a singleton controller so remounts cannot multiply listeners or pollers.
 */

let currentController = null;

/** @description Creates the detached feature vessel adopted by the shell. @returns {HTMLElement} Unique Sub-agents root. @sideEffects Creates DOM nodes only. */
export function subAgents() {
	return createSubAgentDeck();
}

/** @description Mounts exactly one controller for the currently adopted Sub-agents root. @param {Function} getTunnelName - Returns active tunnel name. @returns {object|null} Mounted controller or null when root is absent. @sideEffects Installs feature listeners and one poller. */
export function mountSubAgents(getTunnelName) {
	const root = document.getElementById("subAgentCommandDeck");
	if (!root) return null;
	if (currentController?.root === root) return currentController;
	currentController?.destroy?.();
	currentController = createSubAgentController(root, getTunnelName);
	currentController.mount();
	return currentController;
}

/** @description Removes the current singleton controller. @returns {void} @sideEffects Removes listeners and polling. */
export function unmountSubAgents() {
	currentController?.destroy?.();
	currentController = null;
}
