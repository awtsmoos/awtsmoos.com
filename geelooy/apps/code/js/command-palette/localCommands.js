//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file localCommands.js
 * @description
 * The Awtsmoos renews the nearby tool without confusing it with a global decree;
 * Awtsmoos.com keeps search, tabs, Vibe, and graph actions in one local family.
 * This module owns palette-only commands that do not belong in the action registry.
 */

import { State } from "../state.js";
import { Tabs } from "../tabs/index.js";
import { UI } from "../ui.js";
import { VisualEngine } from "../visuals/index.js";

/** Returns the currently active editor tab when one exists. */
function activeTab() {
	return State.tabs.find(tab => tab.id === State.activeTabId);
}

/** Builds the directory item that owns the supplied editor tab. */
function parentItem(tab) {
	const slashIndex = tab.item.path.lastIndexOf("/");
	const parentPath = tab.item.path.substring(0, slashIndex) || "/";
	return {
		...tab.item,
		path: parentPath,
		kind: "directory",
		name: parentPath.split("/").pop() || "Root"
	};
}

/** Returns an active tab or displays the supplied warning. */
function requireActiveTab(message) {
	const tab = activeTab();
	if (tab?.item) {
		return tab;
	}
	UI.showToast(message, "warning");
	return null;
}

/** Opens search already scoped to the active file's directory. */
async function scopeToActive() {
	const tab = requireActiveTab("No active file to scope search.");
	if (!tab) {
		return null;
	}
	const module = await import("../search-system.js");
	return module.SearchSystem.show(parentItem(tab));
}

/** Opens the Vibe context for the active file's directory. */
async function openVibeContext() {
	const tab = requireActiveTab("No active file to infer Vibe context.");
	if (!tab) {
		return null;
	}
	const module = await import("../vibe/vibe-controller.js");
	return module.VibeController.open(parentItem(tab));
}

/** Opens external-AI context for the active workspace directory. */
async function openAIManifestation() {
	const tab = requireActiveTab("No active file to infer workspace context.");
	if (!tab) {
		return null;
	}
	const module = await import("../features/ai-manifestation/index.js");
	const item = parentItem(tab);
	item.workspaceId = tab.item.workspaceId;
	return module.AIManifestation.showDialog(item);
}

/** Clears the current search scope without changing other search state. */
async function clearSearchScope() {
	const module = await import("../search-system.js");
	module.SearchSystem.currentScopeItem = null;
	return UI.showToast("Search scope cleared.", "info");
}

/**
 * Executes one command that exists only inside the command palette layer.
 * @param {string} actionId Logical palette command identifier.
 * @returns {Promise<{handled: boolean, result?: unknown}>} Handling result.
 */
export async function executeLocalPaletteCommand(actionId) {
	switch (actionId) {
		case "reload-window":
			return { handled: true, result: globalThis.location.reload() };
		case "show-search":
			return { handled: true, result: (await import("../search-system.js")).SearchSystem.show() };
		case "scope-to-active":
			return { handled: true, result: await scopeToActive() };
		case "scope-clear":
			return { handled: true, result: await clearSearchScope() };
		case "close-tab-direct":
			return { handled: true, result: State.activeTabId ? Tabs.close(State.activeTabId) : null };
		case "open-vibe-context":
			return { handled: true, result: await openVibeContext() };
		case "apply-external-ai-context":
			return { handled: true, result: await openAIManifestation() };
		case "show-graph-nav":
			return { handled: true, result: VisualEngine.triggerGraphNav() };
		case "open-browser-tab":
			return { handled: true, result: (await import("../browser/index.js")).BrowserManager.open() };
		default:
			return { handled: false };
	}
}
