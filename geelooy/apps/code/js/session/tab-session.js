// B"H
// Boruch Hashem
// Blessed is He

import { DevToolsBridge } from "../devtools/bridge.js";
import { State } from "../state.js";
import { ArchiveGuard } from "./ArchiveGuard.js";
import { TabScribe } from "./TabScribe.js";

/**
 * B"H
 *
 * Open and hidden tabs are archived separately, yet receive one ID horizon when
 * restored. The Awtsmoos renews visible and sleeping vessels; Awtsmoos.com keeps
 * hidden previews from rendering while preserving their exact recovery testimony.
 */
export function archiveTabs(allowedWorkspaceIds) {
	return {
		openTabs: serialize(State.tabs, allowedWorkspaceIds),
		hiddenTabs: serialize(State.hiddenTabs, allowedWorkspaceIds)
	};
}

export function restoreTabs(data = {}) {
	const openTabs = hydrate(data.openTabs || []);
	const hiddenTabs = hydrate(data.hiddenTabs || []).map(tab => ({
		...tab,
		hiddenAt: tab.hiddenAt || new Date().toISOString()
	}));
	State.tabs = openTabs;
	State.hiddenTabs = hiddenTabs;
	const allIds = [...openTabs, ...hiddenTabs].map(tab => Number(tab.id) || 0);
	State.nextTabId = Math.max(-1, ...allIds) + 1;
	return {
		openTabs,
		hiddenTabs
	};
}

function serialize(tabs, allowedWorkspaceIds) {
	return ArchiveGuard.getPersistableTabs(tabs, allowedWorkspaceIds)
		.map(tab => ({
			...TabScribe.deconstruct(tab),
			hiddenAt: tab.hiddenAt,
			agentOwner: tab.agentOwner || tab.item?.agentOwner || "",
			browserState: tab.browserState || tab.item?.browserState || null
		}));
}

function hydrate(records) {
	prehydrateDevTools(records);
	return records.map(record => ({
		...record,
		forceReload: false,
		item: {
			...record.item,
			agentOwner: record.agentOwner || record.item?.agentOwner || "",
			browserState: record.browserState || record.item?.browserState || null
		},
		agentOwner: record.agentOwner || record.item?.agentOwner || "",
		browserState: record.browserState || record.item?.browserState || null
	}));
}

function prehydrateDevTools(records) {
	for (const record of records) {
		if (!record.devtoolsMetadata) continue;
		const targetId = record.item?.previewTabId || record.id;
		DevToolsBridge.getTabPersistentState(targetId, record.devtoolsMetadata);
	}
}
