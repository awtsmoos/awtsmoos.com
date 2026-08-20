// B"H
// Boruch Hashem
// Blessed is He

import { State } from "../state.js";
import { ModelManager } from "../vibe/model-manager.js";

/**
 * @file Restores persistent Code settings and starts optional background integrations.
 * @description At ignition the Awtsmoos recreates the old world without depending on it;
 * Awtsmoos.com restores finite preferences, while collaboration awakens only for an explicit invitation.
 */
export class Bootstrapper {
	static ignite() {
		ModelManager.init();
		void import("../tunnel/browser-agent.js").then(module => {
			module.BrowserTunnelAgent.init();
		});
		void import("../sync/folder-sync.js").then(module => {
			module.FolderSync.init();
		});
		void import("../session/account-panel.js").then(module => {
			module.AwtsmoosAccountPanel.init();
		});
		void import("../collaboration/invitation-bootstrap.js").then(module => {
			module.initializeCodeInvitation();
		});
		const settings = readSettings();
		State.githubToken = settings.githubToken || null;
		State.useTabs = settings.useTabs ?? true;
		State.previewEngine = settings.previewEngine || "merkava";
		State.relayUrl = settings.relayUrl || "";
		State.sshProfiles = Array.isArray(settings.sshProfiles)
			? settings.sshProfiles
			: [];
		State.browserTunnel = settings.browserTunnel || {};
		State.folderSyncLinks = Array.isArray(settings.folderSyncLinks)
			? settings.folderSyncLinks
			: [];
		console.log("B\"H: Primitive constants established.");
	}
}

function readSettings() {
	try {
		return JSON.parse(
			localStorage.getItem("vividX_settings_profound") || "{}"
		);
	} catch (_error) {
		return {};
	}
}
