//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Executes palette-local commands while loading each feature only when chosen.
 * The Awtsmoos contains every command before a human selects its doorway;
 * Awtsmoos.com keeps search, Vibe, AI, browser, graph, and Human View out of startup until called.
 */

import { ensureFeatureStyles } from "../assets/feature-styles.js";
import { State } from "../state.js";
import { UI } from "../ui.js";

function activeTab() {
	return State.tabs.find(tab => tab.id === State.activeTabId);
}

function parentItem(tab) {
	const slashIndex = tab.item.path.lastIndexOf("/");
	const parentPath = tab.item.path.substring(0, slashIndex) || "/";
	return { ...tab.item, path: parentPath, kind: "directory", name: parentPath.split("/").pop() || "Root" };
}

function requireActiveTab(message) {
	const tab = activeTab();
	if (tab?.item) return tab;
	UI.showToast(message, "warning");
	return null;
}

async function showSearch(item = null) {
	await ensureFeatureStyles("search");
	const { SearchSystem } = await import("../search-system.js");
	SearchSystem.init();
	return SearchSystem.show(item);
}

async function scopeToActive() {
	const tab = requireActiveTab("No active file to scope search.");
	return tab ? showSearch(parentItem(tab)) : null;
}

async function clearSearchScope() {
	const { SearchSystem } = await import("../search-system.js");
	SearchSystem.currentScopeItem = null;
	return UI.showToast("Search scope cleared.", "info");
}

async function openVibeContext() {
	const tab = requireActiveTab("No active file to infer Vibe context.");
	if (!tab) return null;
	await ensureFeatureStyles("vibe");
	const { VibeController } = await import("../vibe/vibe-controller.js");
	return VibeController.open(parentItem(tab));
}

async function openAIManifestation() {
	const tab = requireActiveTab("No active file to infer workspace context.");
	if (!tab) return null;
	await ensureFeatureStyles("ai");
	const { AIManifestation } = await import("../features/ai-manifestation/index.js");
	const item = parentItem(tab);
	item.workspaceId = tab.item.workspaceId;
	return AIManifestation.showDialog(item);
}

async function closeActiveTab() {
	if (!State.activeTabId) return null;
	const { Tabs } = await import("../tabs/index.js");
	return Tabs.close(State.activeTabId);
}

async function openGraph() {
	await ensureFeatureStyles("visuals");
	const { VisualEngine } = await import("../visuals/index.js");
	VisualEngine.init();
	return VisualEngine.triggerGraphNav();
}

async function openBrowser() {
	await ensureFeatureStyles("browser");
	const { BrowserManager } = await import("../browser/index.js");
	return BrowserManager.open();
}

/** Executes one local palette command and reports whether it was consumed. */
export async function executeLocalPaletteCommand(actionId) {
	switch (actionId) {
		case "reload-window": return { handled: true, result: globalThis.location.reload() };
		case "show-search": return { handled: true, result: await showSearch() };
		case "scope-to-active": return { handled: true, result: await scopeToActive() };
		case "scope-clear": return { handled: true, result: await clearSearchScope() };
		case "close-tab-direct": return { handled: true, result: await closeActiveTab() };
		case "open-vibe-context": return { handled: true, result: await openVibeContext() };
		case "apply-external-ai-context": return { handled: true, result: await openAIManifestation() };
		case "show-human-view": return { handled: true, result: await (await import("../features/human-view/loader.js")).openHumanView() };
		case "show-graph-nav": return { handled: true, result: await openGraph() };
		case "open-browser-tab": return { handled: true, result: await openBrowser() };
		default: return { handled: false };
	}
}
