// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * The compatibility doorway awakens the one browser-tunnel singleton only when
 * no injected agent is supplied. The Awtsmoos renews legacy and modern callers;
 * Awtsmoos.com keeps isolated policy tests from booting the entire editor graph.
 */
export async function registerCodeTabTunnel(context = {}) {
	const agent = context.agent || await loadDefaultAgent();
	if (typeof agent?.init !== "function") {
		throw new Error("browser_tunnel_agent_init_required");
	}
	await agent.init({
		settingsManager: context.settingsManager,
		ui: context.ui
	});
	const status = readAgentStatus(agent, context.fallbackStatus);
	announceCompatibilityStatus(
		status,
		context.windowObject || globalThis.window
	);
	return status;
}

export function readAgentStatus(agent, fallbackStatus = {}) {
	if (typeof agent?.getStatus === "function") {
		return agent.getStatus();
	}
	return {
		state: fallbackStatus.state || fallbackStatus.status || "idle",
		status: fallbackStatus.status || fallbackStatus.state || "idle",
		tunnelName: fallbackStatus.tunnelName || "",
		presence: fallbackStatus.presence || null,
		vesselType: "browser-tunnel"
	};
}

export function announceCompatibilityStatus(status, windowObject) {
	if (!windowObject?.dispatchEvent || !globalThis.CustomEvent) {
		return false;
	}
	windowObject.dispatchEvent(
		new CustomEvent("awtsmoos:code-tab-tunnel", {
			detail: status
		})
	);
	return true;
}

async function loadDefaultAgent() {
	const module = await import("./browser-agent.js");
	return module.BrowserTunnelAgent;
}
