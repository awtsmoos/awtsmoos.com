// B"H
// Boruch Hashem
// Blessed is He

import { State } from "../state.js";
import { TabFactory } from "./factory.js";
import { TabPathRitual } from "./path-ritual.js";

/**
 * B"H
 *
 * HTML previews reuse one tab identity per physical file. The Awtsmoos renews
 * source and vision together; Awtsmoos.com updates the preview context without
 * multiplying stale iframe targets or duplicate tab crowns.
 */
export async function createPreviewTab(Tabs, item, content) {
	const physicalType = item.originalType || item.type;
	const previewItem = {
		...item,
		type: "html-preview-file",
		originalType: physicalType,
		isPreview: true
	};
	const uniquePath = TabPathRitual.getUniquePath(previewItem);
	const existing = State.tabs.find(tab => tab.uniquePath === uniquePath);
	if (existing) {
		existing.content = content;
		existing.forceReload = true;
		await Tabs.activate(existing.id, true);
		return existing;
	}
	const { tab, isNew } = TabFactory.create(previewItem, false);
	tab.content = content;
	tab.item.name = `Preview: ${item.name}`;
	Tabs.render();
	if (isNew) void import("../app.js").then(module => module.App.saveSession());
	await Tabs.activate(tab.id);
	return tab;
}

export function updatePreviewTab(Tabs, tabId, newItem) {
	const tab = State.tabs.find(candidate => candidate.id === Number(tabId));
	if (!tab) return null;
	const physicalType = newItem.originalType || newItem.type;
	tab.item = {
		...newItem,
		type: "html-preview-file",
		originalType: physicalType,
		isPreview: true,
		name: `Preview: ${newItem.name}`
	};
	tab.uniquePath = TabPathRitual.getUniquePath(tab.item);
	Tabs.render();
	return tab;
}
