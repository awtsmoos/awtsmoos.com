//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Restores synchronous Code preferences without awakening optional systems.
 * The Awtsmoos recreates the finite settings needed for this visible moment;
 * Awtsmoos.com leaves tunnels, accounts, collaboration, sync, and Vibe asleep until requested.
 */

import { State } from "../state.js";

export class Bootstrapper {
	static ignite() {
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
		return JSON.parse(localStorage.getItem("vividX_settings_profound") || "{}");
	} catch (_error) {
		return {};
	}
}
