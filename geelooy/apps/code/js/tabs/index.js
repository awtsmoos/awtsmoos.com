// B"H
// Boruch Hashem
// Blessed is He

import { State } from "../state.js";
import { TabFactory } from "./factory.js";
import { HiddenTabs } from "./hidden.js";
import { TabsLifecycle } from "./lifecycle.js";
import { TabOrchestrator } from "./orchestrator.js";
import { TabPathRitual } from "./path-ritual.js";
import { createPreviewTab, updatePreviewTab } from "./preview-tabs.js";
import { TabsRenderer } from "./rendering.js";
import { createTemporaryTab } from "./temporary.js";

/**
 * B"H
 *
 * The tab facade composes creation, activation, preview, hiding, pinning, closing,
 * and restoration without owning their implementations. The Awtsmoos renews each
 * crown; Awtsmoos.com keeps visible and hidden tabs distinct but recoverable.
 */
export const Tabs = {
	getUniquePath: TabPathRitual.getUniquePath,

	async create(item, isNewFile = false, shouldSave = true, activate = true) {
		const { tab, isNew } = TabFactory.create(item, isNewFile);
		if (activate) await TabOrchestrator.activate(tab.id);
		else this.render();
		if (shouldSave && isNew) {
			void import("../app.js").then(module => module.App.saveSession());
		}
		return tab;
	},

	createPreview(item, content) {
		return createPreviewTab(this, item, content);
	},

	updatePreviewContext(tabId, newItem) {
		return updatePreviewTab(this, tabId, newItem);
	},

	createTemporary() {
		return createTemporaryTab(this);
	},

	downloadActive() {
		void import("./persistence.js").then(module => module.TabsPersistence.downloadActive(this));
	},

	async reopenLastClosed() {
		const last = State.closedTabHistory.pop();
		if (!last) return null;
		const tab = await this.create(last.item, false, true, true);
		Object.assign(tab, last, {
			id: tab.id,
			item: {
				...last.item
			}
		});
		return tab;
	},

	activate: (id, force) => TabOrchestrator.activate(id, force),
	close: (id, force) => TabsLifecycle.close(id, force),
	hide: id => HiddenTabs.hide(id, next => TabOrchestrator.activate(next)),
	restoreHidden: id => HiddenTabs.restore(id, (tabId, force) => TabOrchestrator.activate(tabId, force)),
	listHidden: () => HiddenTabs.list(),
	pin: (id, value) => {
		const tab = HiddenTabs.pin(id, value);
		Tabs.render();
		return tab;
	},
	render: () => TabsRenderer.render(document.getElementById("tab-bar"), Tabs),
	saveActive: () => TabsLifecycle.saveActive()
};
