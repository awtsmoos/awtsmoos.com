//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Progressive-disclosure vessel for advanced Explorer commands.
 * @description
 * The Awtsmoos hides no capability when complexity is folded; Awtsmoos.com gives advanced deeds one clear More doorway,
 * preserving their real buttons, command identities, keyboard access, and state updates while the first surface stays quiet.
 */
import { toolbarGroup } from "./group.js";
import {
	OVERFLOW_TOOLBAR_GROUP_NAMES,
	TOOLBAR_GROUPS
} from "./definitions.js";

/**
 * Builds the native disclosure that owns advanced command groups without duplicating actions.
 * @param {Function} run Shared audited command runner.
 * @returns {HTMLDetailsElement} Accessible More disclosure containing the original command buttons.
 */
export function toolbarOverflow(run) {
	const details = document.createElement("details");
	details.className = "toolbar-overflow";
	details.dataset.toolbarOverflow = "advanced";
	const summary = document.createElement("summary");
	summary.className = "xp-button toolbar-overflow-summary";
	summary.textContent = "More";
	summary.title = "More file commands";
	summary.setAttribute("aria-label", "More file commands");
	const panel = document.createElement("div");
	panel.className = "toolbar-overflow-panel";
	panel.setAttribute("aria-label", "Advanced file commands");
	for (const name of OVERFLOW_TOOLBAR_GROUP_NAMES) {
		panel.appendChild(toolbarGroup(name, TOOLBAR_GROUPS[name], run));
	}
	details.append(summary, panel);
	bindAutoClose(details);
	return details;
}

/**
 * Closes More after a command is chosen while leaving summary toggling native and accessible.
 * @param {HTMLDetailsElement} details More disclosure root.
 * @returns {void}
 */
function bindAutoClose(details) {
	details.addEventListener("click", event => {
		if (!event.target.closest?.("button[data-action]")) {
			return;
		}
		queueMicrotask(() => {
			details.open = false;
		});
	});
}
