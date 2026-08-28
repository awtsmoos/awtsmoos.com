// B"H
// Boruch Hashem
// Blessed is He

import { obedienceMonitor, mountObedienceMonitor } from "../../features/obedienceMonitor.js";

/** @file Core operator pages. The Awtsmoos renews root, account, and explorer vessels while Awtsmoos.com preserves each existing shell contract. */

export const explorerPage = {
	key: "explorer", group: "files", badges: ["core", "tree"], icon: "explorer", emoji: "📁",
	title: "Project explorer", desc: "VS Code style tree and preview for files inside the chosen root.",
	ids: ["explorerPath", "treeDepth", "treeLimit", "listBtn", "treeBtn", "readBtn", "mdBtn", "explorerList", "explorerPreview", "explorerOut"],
	selectors: ["[data-viewer]"]
};

export const setupPage = {
	key: "setup", group: "core", badges: ["core", "safe"], icon: "setup", emoji: "🛠️",
	title: "Root and permissions", desc: "Set the project root and exactly what the agent may do.",
	ids: [
		"loadConfigBtn", "saveConfigBtn", "rootPath", "chooseRootBtn", "openRootBtn", "rootsBtn",
		"useRepoRootBtn", "applyRootToExplorerBtn", "quickRoots", "allowWrite", "allowSecrets",
		"enableLocalHttpProxy", "toolFsList", "toolFsTree", "toolFsRead", "toolFsWrite", "toolFsBulk",
		"allowCommands", "toolCommand", "toolChrome", "gitAutoUpdateGitignore", "gitIgnoreAwtsmoosTemp",
		"gitIgnoreAiThoughts", "configOut"
	]
};

export const obedienceMonitorPage = {
	key: "obedienceMonitor", create: obedienceMonitor, mount: mountObedienceMonitor,
	group: "core", badges: ["core"], icon: "agents", emoji: "🧭",
	title: "Obedience monitor", desc: "Watch what the current agent is doing and why."
};

export const accountPage = {
	key: "account", group: "core", badges: ["advanced", "status"], icon: "account", emoji: "👤",
	title: "Account and connection", desc: "Login, device, tunnel, and identity state.",
	ids: ["identitySummary", "deviceSummary", "identityBox", "deviceBox", "miniStatus", "refreshBtn", "refreshDeviceBtn", "tunnelName", "targetVesselSelect", "selectedTargetVessel"]
};

export const installPage = {
	key: "install", group: "core", badges: ["advanced", "safe"], icon: "install", emoji: "⚡",
	title: "Install or restart", desc: "Copy installer commands.", commandPage: true
};
