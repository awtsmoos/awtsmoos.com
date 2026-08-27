// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reads Code settings without confusing remembered consent with live authority.
 * @description
 * The Awtsmoos seals the user's durable choices while Awtsmoos.com keeps the current
 * browser socket outside settings persistence. Name, relay, editor choices, and a
 * remembered invitation may endure; current-session authority is renewed only by
 * explicit runtime actions in the tunnel console.
 */

import { State } from "../../state.js";
import { setBrowserTunnelRemembered } from "../../tunnel/browser-agent-state.js";
import { collectSshProfiles } from "./ssh.js";

export function collectSettings(container) {
	State.githubToken = container.querySelector("#github-token-input")?.value || null;
	State.relayUrl = container.querySelector("#relay-url-input")?.value.trim() || "";
	State.useTabs = Boolean(container.querySelector("#use-tabs-checkbox")?.checked);
	State.previewEngine = container.querySelector("#preview-engine-select")?.value || "merkava";
	State.sshProfiles = collectSshProfiles(container);
	const remembered = Boolean(container.querySelector("#browser-tunnel-enabled")?.checked);
	State.browserTunnel = {
		...(State.browserTunnel || {}),
		remembered,
		autoStart: remembered,
		tunnelName: container.querySelector("#browser-tunnel-name")?.value.trim() || State.browserTunnel?.tunnelName || "",
		relayUrl: container.querySelector("#browser-tunnel-relay")?.value.trim() || ""
	};
	setBrowserTunnelRemembered(remembered);
	return snapshot();
}

export function saveSettings(container) {
	const settings = collectSettings(container);
	localStorage.setItem("vividX_settings_profound", JSON.stringify(settings));
	return settings;
}

export function snapshot() {
	return {
		githubToken: State.githubToken,
		relayUrl: State.relayUrl,
		sshProfiles: State.sshProfiles,
		browserTunnel: State.browserTunnel,
		folderSyncLinks: State.folderSyncLinks || [],
		previewEngine: State.previewEngine || "merkava",
		useTabs: State.useTabs
	};
}
