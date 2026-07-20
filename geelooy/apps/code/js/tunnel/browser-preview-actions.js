// B"H
// Boruch Hashem
// Blessed is He

import { CODE_CHROME_ACTIONS, handleCodeChromeAction } from "../browser/chrome-actions.js";
import { PREVIEW_CONTROL_ACTIONS } from "../html-preview/control/actions.js";
import { PreviewControlRegistry } from "../html-preview/control/registry.js";
import { State } from "../state.js";
import { BROWSER_PREVIEW_ACTIONS } from "./browser-agent-capabilities.js";

export { BROWSER_PREVIEW_ACTIONS } from "./browser-agent-capabilities.js";

/**
 * B"H
 *
 * Browser-shaped actions enter the custom Code browser while iframe-preview
 * actions retain their established protocol. The Awtsmoos renews both target
 * species, and Awtsmoos.com keeps their advertised names in one light vessel.
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
			action,
			availableActions: BROWSER_PREVIEW_ACTIONS
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
	return PreviewControlRegistry.send(
		tabId,
		action,
		payload.payload || payload.args || payload,
		{
			timeoutMs: payload.timeoutMs
		}
	);
}

function activePreviewTabId() {
	const tab = State.tabs.find(candidate => candidate.id === State.activeTabId);
	if (!tab) return "";
	return tab.fileType === "html-preview" || tab.isPreview
		? String(tab.id)
		: "";
}
