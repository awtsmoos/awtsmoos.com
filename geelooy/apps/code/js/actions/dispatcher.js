//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file dispatcher.js
 * @description
 * The Awtsmoos renews command, context, and consequence in one living flow;
 * Awtsmoos.com guards each doorway so URLs never masquerade as modules below.
 * This dispatcher keeps virtual-file reads safe and routes actions deliberately.
 */

import { ActionRegistry } from "./registry.js";
import { ActionExecutor } from "./executor.js";
import { isPortalActionId, openPortalAction } from "./portalUrl.js";
import { FileSystemProvider } from "../fs-provider.js";

const VIRTUAL_ITEM_TYPES = new Set([
	"vibe-manager",
	"html-preview-file",
	"devtools",
	"browser"
]);

/** Returns a stable object context for every action invocation. */
function normalizeContext(context) {
	if (typeof context === "object" && context !== null) {
		return context;
	}
	return { payload: context };
}

/** Reports whether a filesystem item should prefer its in-memory content. */
function isVirtualItem(item = {}) {
	return item.isVirtual === true || VIRTUAL_ITEM_TYPES.has(item.type);
}

/** Installs the virtual-file read sentinel exactly once. */
function installVirtualReadGuard() {
	if (FileSystemProvider._awtsmoosVirtualGuarded) {
		return;
	}
	const originalRead = FileSystemProvider.read;
	if (typeof originalRead === "function") {
		FileSystemProvider.read = async function guardedRead(item, ...args) {
			if (isVirtualItem(item) && item.content) {
				return item.content;
			}
			return await originalRead.apply(this, [item, ...args]);
		};
	}
	FileSystemProvider._awtsmoosVirtualGuarded = true;
}

/** Displays one bounded failure without hiding the underlying console error. */
async function showDispatchFailure(error) {
	try {
		const { UI } = await import("../ui.js");
		UI.showToast(`Action failed: ${error.message || error}`, "error", 9000);
	} catch (toastError) {
		console.warn("B\"H - Dispatch toast unavailable.", toastError);
	}
}

/** Handles URL-bearing action identifiers before module resolution can see them. */
function dispatchPortal(actionId) {
	const result = openPortalAction(actionId);
	if (!result.ok) {
		throw new Error(result.error || "portal_action_failed");
	}
	return result;
}

export const ActionDispatcher = {
	/** Awakens the filesystem sentinel used by virtual editor vessels. */
	init() {
		installVirtualReadGuard();
	},

	/**
	 * Resolves and executes one logical action request.
	 * @param {string} actionId Logical action name or explicit portal action.
	 * @param {unknown} context Invocation context or payload.
	 * @returns {Promise<unknown>} Action result when successful.
	 */
	async dispatch(actionId, context) {
		console.log(`B"H - Dispatching action -> [${actionId}]`);
		try {
			if (isPortalActionId(actionId)) {
				return dispatchPortal(actionId);
			}
			const actionDefinition = await ActionRegistry.resolve(actionId);
			if (!actionDefinition) {
				throw new Error(`action_not_found:${String(actionId)}`);
			}
			return await ActionExecutor.execute(
				actionDefinition,
				normalizeContext(context),
				actionId
			);
		} catch (error) {
			console.error(`B"H - Fatal Dispatch Barrier for [${actionId}]`, error);
			await showDispatchFailure(error);
			return null;
		}
	}
};
