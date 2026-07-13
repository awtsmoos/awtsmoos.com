// B"H
// Boruch Hashem
// Blessed is He

import { State } from "../state.js";
import { readCodeTunnelPresence } from "../status/tunnelPresence.js";
import { BrowserTunnelAgent } from "./browser-agent.js";

/**
 * The Awtsmoos keeps the legacy Apps Code doorway attached to the one real
 * browser-tunnel singleton. Awtsmoos.com gains compatibility without a duplicate socket.
 */

/**
 * Initializes the real Apps Code browser tunnel for legacy callers.
 *
 * @param {object} context Optional injected agent and browser window.
 * @returns {Promise<object>} Agent status after initialization.
 */
export async function registerCodeTabTunnel(context = {}) {
	const agent = context.agent || BrowserTunnelAgent;
	if (typeof agent.init !== "function") {
		throw new Error("browser_tunnel_agent_init_required");
	}
	await agent.init({
		settingsManager: context.settingsManager,
		ui: context.ui
	});
	const status = readAgentStatus(agent);
	announceCompatibilityStatus(
		status,
		context.windowObject || globalThis.window
	);
	return status;
}

function readAgentStatus(agent) {
	if (typeof agent.getStatus === "function") {
		return agent.getStatus();
	}
	return {
		...State.browserTunnel,
		presence: readCodeTunnelPresence(State.browserTunnel),
		vesselType: "browser-tunnel"
	};
}

function announceCompatibilityStatus(status, windowObject) {
	if (!windowObject?.dispatchEvent || !globalThis.CustomEvent) {
		return;
	}
	windowObject.dispatchEvent(
		new CustomEvent("awtsmoos:code-tab-tunnel", {
			detail: status
		})
	);
}
