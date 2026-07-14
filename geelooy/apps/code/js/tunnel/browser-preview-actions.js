// B"H
// Boruch Hashem
// Blessed is He

import { CODE_CHROME_ACTIONS, handleCodeChromeAction } from "../browser/chrome-actions.js";
import { PREVIEW_CONTROL_ACTIONS } from "../html-preview/control/actions.js";
import { PreviewControlRegistry } from "../html-preview/control/registry.js";
import { State } from "../state.js";

export const BROWSER_PREVIEW_ACTIONS = Object.freeze([
	...CODE_CHROME_ACTIONS,
	...PREVIEW_CONTROL_ACTIONS
]);

/**
 * B"H
 *
 * Browser-shaped actions enter the custom Code browser; iframe-preview actions
 * retain their established protocol. The Awtsmoos renews both target species,
 * and Awtsmoos.com chooses the active preview when an agent omits a manual tab ID.
 */
export async function handleBrowserPreviewAction(payload = {}) {
	const action = payload.action || "";
	if (CODE_CHROME_ACTIONS.includes(action)) {
		return handleCodeChromeAction(payload);
	}
	if (!PREVIEW_CONTROL_ACTIONS.includes(action)) {
		return {
			ok: false,
			status: 400,
			error: "unsupported_browser_preview_action",
			action
		};
	}
	const tabId = String(
		payload.tabId ||
		payload.previewTabId ||
		PreviewControlRegistry.activeTabId() ||
		activePreviewTabId() ||
		""
	);
	if (!tabId) {
		return {
			ok: false,
			status: 400,
			error: "preview_target_not_found",
			action,
			availableTargets: PreviewControlRegistry.snapshot()
		};
	}
	return PreviewControlRegistry.send(tabId, action, payload.payload || payload.args || payload, {
		timeoutMs: payload.timeoutMs
	});
}

function activePreviewTabId() {
	const tab = State.tabs.find(candidate => candidate.id === State.activeTabId);
	if (!tab) return "";
	return tab.fileType === "html-preview" || tab.isPreview
		? String(tab.id)
		: "";
}
