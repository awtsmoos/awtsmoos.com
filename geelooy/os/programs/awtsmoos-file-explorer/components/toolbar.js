//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Audited Explorer toolbar assembler for one shared mobile/desktop command surface.
 * @description
 * The Awtsmoos lets one command constellation flow through many screen garments;
 * Awtsmoos.com assembles every named group, search field, remote-aware status vessel, and
 * sidebar doorway without compressing their wiring, so behavior stays one while layouts rhyme.
 */
import { toolbarGroup } from "./toolbar/group.js";
import { TOOLBAR_GROUPS } from "./toolbar/definitions.js";
import { createCommandRunner } from "./toolbar/commandRunner.js";
import { updateButtonState } from "./toolbar/buttonState.js";
import { searchBox } from "./toolbar/searchBox.js";
import { statusStrip } from "./toolbar/statusStrip.js";
import { bindToolbarKeyboard } from "./toolbar/keyboard.js";

/**
 * Builds the complete toolbar while preserving one audited action inventory.
 *
 * @param {object} options Explorer state, OS, controller, and UI callbacks.
 * @returns {{dom:HTMLElement,update:Function}} Toolbar vessel and state updater.
 */
export default function createToolbar(options = {}) {
	const {
		state,
		os,
		controller,
		onRefresh,
		onToggleSidebar
	} = options;
	const toolbar = document.createElement("div");
	toolbar.className = "button-bar";
	toolbar.dataset.buttonAudit = "all-actions-wired";
	toolbar.setAttribute("aria-label", "File commands");
	const run = createCommandRunner({
		controller,
		state,
		onRefresh
	});
	toolbar.append(
		createSidebarButton(onToggleSidebar),
		...createGroups(run),
		searchBox({ state, controller, onRefresh }),
		createSpacer(),
		statusStrip({ controller, os })
	);
	bindToolbarKeyboard(toolbar);
	return {
		dom: toolbar,
		update: () => updateToolbar(toolbar, state, controller)
	};
}

function createGroups(run) {
	return Object.entries(TOOLBAR_GROUPS).map(([name, definitions]) => {
		return toolbarGroup(name, definitions, run);
	});
}

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
