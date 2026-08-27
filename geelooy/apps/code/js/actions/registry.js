//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file registry.js
 * @description
 * Every command is a spark seeking its proper vessel. The Awtsmoos renews the
 * registry and the action together; Awtsmoos.com keeps lazy modules rooted in
 * their true source even when the server gathers many modules into one bundle.
 */

import { CORE_FILE_ACTIONS } from "./categories/file-core.js";
import { UI_LAYOUT_ACTIONS } from "./categories/ui-layout.js";
import { TAB_MANAGEMENT_ACTIONS } from "./categories/tab-mgmt.js";
import { PREVIEW_DEVTOOLS_ACTIONS } from "./categories/preview-dev.js";
import { DATA_TRANSFER_ACTIONS } from "./categories/data-transfer.js";
import { TEXT_TRANS_ACTIONS } from "./categories/text-trans.js";
import { commandModuleUrl } from "./commandModuleUrl.js";
import { MenuUI } from "../menus/ui.js";

const COMMAND_CACHE = new Map();

/** Builds a URL from the served Geelooy root. */
function appUrl(path) {
	return new URL(path, globalThis.location.origin).toString();
}

/** Opens the standalone AI chat inside the Code browser vessel. */
async function openGenericAiChat() {
	const module = await import("../browser/index.js");
	const url = appUrl("/ai/?awtsmoosAi=minimax");
	return await module.BrowserManager.open(url, { name: "AI Chat" });
}

/** Opens an empty inner browser tab. */
async function openBrowserTab() {
	const module = await import("../browser/index.js");
	return await module.BrowserManager.open();
}

/** Opens DevTools for the supplied preview/browser context. */
async function openDevTools(context) {
	const module = await import("../devtools/open.js");
	return await module.DevToolsOpener.open(context);
}

/** Reveals an item in its owning workspace. */
async function revealInWorkspace(context) {
	const module = await import("./commands/reveal-in-workspace.js");
	return await module.default(context);
}

/** Closes every menu without manufacturing an anonymous command wrapper. */
function cancelMenu() {
	return MenuUI.hideAll();
}

const FALLBACK_ACTIONS = {
	...CORE_FILE_ACTIONS,
	...UI_LAYOUT_ACTIONS,
	...TAB_MANAGEMENT_ACTIONS,
	...PREVIEW_DEVTOOLS_ACTIONS,
	...DATA_TRANSFER_ACTIONS,
	...TEXT_TRANS_ACTIONS,
	"cancel-menu": cancelMenu,
	"reveal-in-workspace": revealInWorkspace,
	"open-browser-tab": openBrowserTab,
	"open-generic-ai-chat": openGenericAiChat,
	"open-devtools": openDevTools
};

/** Returns and caches a known fallback action when one exists. */
function resolveFallback(actionId) {
	const handler = FALLBACK_ACTIONS[actionId];
	if (!handler) {
		return null;
	}
	COMMAND_CACHE.set(actionId, handler);
	return handler;
}

/** Imports one validated lazy command from its canonical browser path. */
async function importLazyCommand(actionId) {
	const module = await import(commandModuleUrl(actionId));
	const executor = module.default || Object.values(module).find(
		exportValue => typeof exportValue === "function"
	);
	if (executor) {
		COMMAND_CACHE.set(actionId, executor);
	}
	return executor || null;
}

export const ActionRegistry = {
	/**
	 * Resolves one logical action identifier to an executable handler.
	 * @param {string} actionId Logical action identifier.
	 * @returns {Promise<Function|null>} Executable handler when found.
	 */
	async resolve(actionId) {
		if (COMMAND_CACHE.has(actionId)) {
			return COMMAND_CACHE.get(actionId);
		}
		const fallback = resolveFallback(actionId);
		if (fallback) {
			return fallback;
		}
		try {
			return await importLazyCommand(actionId);
		} catch (error) {
			console.error(
				`B"H - Registry Error: Action [${actionId}] could not be resolved.`,
				error
			);
			return null;
		}
	}
};
