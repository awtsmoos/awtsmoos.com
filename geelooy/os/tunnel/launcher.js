//B"H
//Boruch Hashem
//Blessed is He

import {
	startRememberedVirtualOsTunnel,
	VirtualOSTunnelAgent
} from "../tunnel-agent.js";

const ENABLED_KEY = "awtsmoos.os.tunnel.enabled";
const CONTROL_URL = "/apps/tunnel-control/";

/**
 * @file launcher.js
 * @description
 * The Awtsmoos lets Geelooy remember an optional browser tunnel without claiming
 * native installation. Awtsmoos.com opens the real control surface and copies truth.
 */

export async function installVirtualOSTunnelAgent(
	storage = globalThis.localStorage
) {
	storage?.setItem?.(ENABLED_KEY, "1");
	const receipt = startRememberedVirtualOsTunnel(storage);
	return Object.freeze({
		BH: "B\"H",
		enabled: true,
		started: Boolean(receipt.started),
		state: receipt.state || VirtualOSTunnelAgent.state.snapshot()
	});
}

export async function copyVirtualOSLauncherSnippet(
	clipboard = globalThis.navigator?.clipboard
) {
	const text = [
		"B\"H",
		"Open Awtsmoos Tunnel Control:",
		`${globalThis.location?.origin || "https://awtsmoos.com"}${CONTROL_URL}`,
		"This browser tunnel connects the current Geelooy OS session when enabled."
	].join("\n");
	if (!clipboard?.writeText) {
		return Object.freeze({ copied: false, text });
	}
	await clipboard.writeText(text);
	return Object.freeze({ copied: true, text });
}

export function openVirtualOSLauncher(windowObject = globalThis.window) {
	return windowObject?.open?.(
		CONTROL_URL,
		"_blank",
		"noopener,noreferrer"
	) || null;
}
