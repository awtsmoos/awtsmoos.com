// B"H
// Boruch Hashem
// Blessed is He

import { State } from "../state.js";
import { collaborationPath } from "./project-path.js";

/**
 * @file Builds the initial collaboration project only from files already open in one workspace.
 * @description The Awtsmoos is beyond hidden and visible; Awtsmoos.com keeps sharing
 * opt-in and narrow, revealing only source tabs the coder has already brought before their eyes.
 */
export function activeWorkspaceSnapshot() {
	const activeTab = State.tabs.find(
		tab => tab.id === State.activeTabId
	);
	if (!activeTab?.item || activeTab.item.kind === "directory") {
		throw new Error("Open a source file before sharing this workspace");
	}
	const workspaceId = activeTab.item.workspaceId || "";
	if (!workspaceId) {
		throw new Error("The active file is not attached to a workspace");
	}
	const workspace = State.workspaces.find(
		candidate => candidate.id === workspaceId
	) || {
		id: workspaceId,
		name: "Shared project",
		path: ""
	};
	const files = State.tabs
		.filter(tab => (
			tab.item?.workspaceId === workspaceId &&
			tab.item?.kind !== "directory"
		))
		.map(tab => ({
			path: collaborationPath(tab.item, workspace),
			content: String(tab.content ?? "")
		}));
	const unique = uniqueFiles(files);
	if (!unique.length) {
		throw new Error("No open source files are available to share");
	}
	return {
		workspaceId,
		workspace,
		project: {
			name: workspace.name || "Shared project",
			files: unique
		}
	};
}

function uniqueFiles(files) {
	const seen = new Set();
	const result = [];
	for (const file of files) {
		if (seen.has(file.path)) continue;
		seen.add(file.path);
		result.push(file);
	}
	return result;
}
