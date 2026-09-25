//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Calm Explorer toolbar assembler with truthful progressive disclosure.
 * @description
 * The Awtsmoos lets a few bright roads reveal a whole command universe; Awtsmoos.com keeps navigation,
 * creation, search, view, and sort immediate while More carries advanced powers without deleting a single deed.
 */
import { createCommandRunner } from "./toolbar/commandRunner.js";
import {
	PRIMARY_TOOLBAR_GROUP_NAMES,
	TOOLBAR_GROUPS
} from "./toolbar/definitions.js";
import { toolbarGroup } from "./toolbar/group.js";
import { bindToolbarKeyboard } from "./toolbar/keyboard.js";
import { toolbarOverflow } from "./toolbar/overflow.js";
import { searchBox } from "./toolbar/searchBox.js";
import { shliachDirectoryButton } from "./toolbar/shliachButton.js";
import { statusStrip } from "./toolbar/statusStrip.js";
import { updateButtonState } from "./toolbar/buttonState.js";

/**
 * Builds the complete toolbar while preserving one audited action inventory.
 * @param {object} options Explorer state, OS, controller, and UI callbacks.
 * @returns {{dom:HTMLElement,update:Function}} Toolbar vessel and state updater.
 */
export default function createToolbar(options = {}) {
	const { state, os, controller, onRefresh, onToggleSidebar } = options;
	const toolbar = document.createElement("div");
	toolbar.className = "button-bar";
	toolbar.dataset.buttonAudit = "all-actions-wired";
	toolbar.setAttribute("aria-label", "File commands");
	const run = createCommandRunner({ controller, state, onRefresh });
	toolbar.append(
		createSidebarButton(onToggleSidebar),
		...createPrimaryGroups(run, ["nav", "create"]),
		searchBox({ state, controller, onRefresh }),
		...createPrimaryGroups(run, ["view", "sort"]),
		shliachDirectoryButton({ state, controller, os }),
		toolbarOverflow(run),
		createSpacer(),
		statusStrip({ controller, os })
	);
	bindToolbarKeyboard(toolbar);
	return {
		dom: toolbar,
		update: () => updateToolbar(toolbar, state, controller)
	};
}

/**
 * Creates only groups declared as primary and requested for the current position.
 * @param {Function} run Shared command runner.
 * @param {string[]} names Requested primary group names.
 * @returns {HTMLElement[]} Wired group nodes.
 */
function createPrimaryGroups(run, names) {
	return names
		.filter(name => PRIMARY_TOOLBAR_GROUP_NAMES.includes(name))
		.map(name => toolbarGroup(name, TOOLBAR_GROUPS[name], run));
}

/**
 * Builds the single sidebar doorway that remains visible at every width.
 * @param {Function} onToggleSidebar Sidebar toggle callback.
 * @returns {HTMLButtonElement} Accessible sidebar button.
 */
function createSidebarButton(onToggleSidebar) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "sidebar-toggle-btn xp-button";
	button.textContent = "☰";
	button.title = "Toggle sidebar";
	button.setAttribute("aria-label", "Toggle sidebar");
	button.dataset.action = "toggleSidebar";
	button.addEventListener("click", onToggleSidebar);
	return button;
}

function createSpacer() {
	const spacer = document.createElement("div");
	spacer.className = "toolbar-spacer";
	return spacer;
}

function updateToolbar(toolbar, state, controller) {
	state.hasClipboard = Boolean(controller.os?.clipboard?.action);
	updateButtonState(toolbar, state);
	toolbar.querySelector(".toolbar-status")?.awtsUpdate?.();
}
