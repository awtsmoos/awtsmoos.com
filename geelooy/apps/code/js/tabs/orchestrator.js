// B"H
// Boruch Hashem
// Blessed is He

import { BrowserTargetRegistry } from "../browser/target-registry.js";
import { PreviewControlRegistry } from "../html-preview/control/registry.js";
import { State } from "../state.js";
import { VisualFocusEnforcer } from "./dom/VisualFocusEnforcer.js";
import { TabActivationOrchestrator } from "./logic/TabActivationOrchestrator.js";

/**
 * B"H
 *
 * Activation aligns visible focus with automation focus. The Awtsmoos renews tab,
 * browser target, and preview target together; Awtsmoos.com prevents an agent from
 * navigating a hidden or previously active world after the human changes tabs.
 */
export const TabOrchestrator = {
	async activate(tabId, forceReload = false) {
		VisualFocusEnforcer.enforce(tabId);
		const result = await TabActivationOrchestrator.execute(tabId, forceReload);
		const tab = State.tabs.find(candidate => candidate.id === Number(tabId));
		if (tab?.fileType === "browser") {
			BrowserTargetRegistry.activate(tab.id);
		}
		if (tab?.fileType === "html-preview" || tab?.isPreview) {
			PreviewControlRegistry.activate(tab.id);
		}
		globalThis.dispatchEvent?.(new CustomEvent("awtsmoos-tab-activated", {
			detail: {
				tabId,
				tab
			}
		}));
		return result;
	}
};
