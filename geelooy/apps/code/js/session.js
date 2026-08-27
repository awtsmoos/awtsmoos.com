// B"H
// Boruch Hashem
// Blessed is He

import { State } from "./state.js";
import { Workspaces } from "./workspaces/index.js";
import { Tabs } from "./tabs/index.js";
import { ArchiveGuard } from "./session/ArchiveGuard.js";
import { archiveTabs, restoreTabs } from "./session/tab-session.js";

const STORAGE_KEY = "vividX_session_profound";

/**
 * B"H
 *
 * Session memory archives workspaces, open tabs, hidden tabs, active focus, and
 * expanded folders without rendering sleeping browser targets. The Awtsmoos
 * renews archive and awakening; Awtsmoos.com restores one coherent tab ID horizon.
 */
export const Session = {
	saveDebounceTimer: null,

	saveDebounced() {
		clearTimeout(this.saveDebounceTimer);
		this.saveDebounceTimer = setTimeout(() => this.save(), 1000);
	},

	save() {
		try {
			const workspaces = ArchiveGuard.getPersistableWorkspaces(State.workspaces);
			const allowedWorkspaceIds = new Set(workspaces.map(workspace => workspace.id));
			const tabs = archiveTabs(allowedWorkspaceIds);
			const activeTab = State.tabs.find(tab => tab.id === State.activeTabId);
			const sessionData = {
				workspaces,
				...tabs,
				activeTabUniquePath: activeTab?.uniquePath || null,
				expandedFolders: [...State.expandedFolders]
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
			console.log('B"H - Session anchored.');
			return sessionData;
		} catch (error) {
			console.warn('B"H - Session Save Failed:', error);
			return null;
		}
	},

	async load() {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		try {
			const data = JSON.parse(raw);
			restoreWorkspaces(data.workspaces || []);
			restoreTabs(data);
			State.expandedFolders = new Set(data.expandedFolders || []);
			if (data.activeTabUniquePath) {
				const active = State.tabs.find(tab => tab.uniquePath === data.activeTabUniquePath);
				if (active) State.activeTabId = active.id;
			}
			Tabs.render();
			Workspaces.render();
			console.log('B"H - Session re-aligned.');
			return data;
		} catch (error) {
			console.error('B"H - Session Reconstitution Failed:', error);
			return null;
		}
	}
};

function restoreWorkspaces(records) {
	for (const workspace of records) {
		Workspaces.add(workspace, false);
	}
	const maximumId = Math.max(-1, ...State.workspaces.map(workspace => Number(workspace.id) || 0));
	State.nextWorkspaceId = maximumId + 1;
}
