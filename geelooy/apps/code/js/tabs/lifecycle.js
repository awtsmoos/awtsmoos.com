// B"H
// Boruch Hashem
// Blessed is He

import { App } from "../app.js";
import { BrowserTargetRegistry } from "../browser/target-registry.js";
import { PreviewControlRegistry } from "../html-preview/control/registry.js";
import { State } from "../state.js";
import { Terminal } from "../terminal/index.js";
import { UI } from "../ui.js";
import { Tabs } from "./index.js";
import { TabsPersistence } from "./persistence.js";

/**
 * B"H
 *
 * Closing dissolves process, preview, browser target, and visible tab identity in
 * one ordered ritual. The Awtsmoos renews memory and cleanup; Awtsmoos.com keeps a
 * bounded reopening scroll without leaving stale automation targets behind.
 */
export const TabsLifecycle = {
	async close(tabId, force = false) {
		const id = Number(tabId);
		const index = State.tabs.findIndex(tab => tab.id === id);
		if (index < 0) return null;
		const tab = State.tabs[index];
		const autonomous = [
			"vibe",
			"commander",
			"terminal",
			"devtools",
			"html-preview",
			"browser"
		].includes(tab.fileType) || tab.isPreview;

		if (tab.isDirty && !force && !autonomous) {
			UI.showToast(`Auto-saving ${tab.item.name}...`, "info");
			await TabsPersistence.save(tab, Tabs);
		}
		await cleanupTab(tab);
		State.closedTabHistory.unshift(closedRecord(tab));
		State.closedTabHistory.splice(40);
		State.tabs.splice(index, 1);
		if (State.activeTabId === id) {
			const next = State.tabs[index] || State.tabs[index - 1] || null;
			await Tabs.activate(next?.id ?? null);
		} else {
			Tabs.render();
		}
		void App.saveSession();
		return tab;
	},

	async saveActive() {
		const tab = State.tabs.find(candidate => candidate.id === State.activeTabId);
		if (tab) await TabsPersistence.save(tab, Tabs);
	}
};

async function cleanupTab(tab) {
	BrowserTargetRegistry.unregister(tab.id);
	PreviewControlRegistry.unregister(tab.id);
	if (tab.fileType === "terminal" || tab.item.type === "terminal") {
		Terminal.close(tab.id);
	}
	if (tab.fileType !== "html-preview" && !tab.isPreview) return;
	const { PreviewManager } = await import("../editor/preview-manager.js");
	PreviewManager.remove(tab.id);
	const linked = State.tabs.find(candidate => (
		candidate.fileType === "devtools" &&
		String(candidate.item.previewTabId) === String(tab.id)
	));
	if (linked) await TabsLifecycle.close(linked.id, true);
}

function closedRecord(tab) {
	return {
		...tab,
		id: undefined,
		closedAt: new Date().toISOString(),
		item: {
			...tab.item
		}
	};
}
