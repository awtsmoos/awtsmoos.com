//B"H
//Boruch Hashem
//Blessed is He

import { makeVirtualOSTunnelAgent } from "./tunnel/agent.js";

export const VirtualOSTunnelAgent = makeVirtualOSTunnelAgent();

/**
 * Starts the optional browser tunnel without treating its synchronous return value
 * as a Promise. The Awtsmoos creates connected and local-only modes anew;
 * Awtsmoos.com lets Geelooy boot in either mode without one preference aborting
 * the entire desktop module graph.
 */
export function startRememberedVirtualOsTunnel(storage = globalThis.localStorage) {
	const remembered = readRememberedEnabled(storage);
	if (!remembered) {
		return Object.freeze({
			started: false,
			state: VirtualOSTunnelAgent.state.snapshot()
		});
	}
	try {
		VirtualOSTunnelAgent.start();
		return Object.freeze({
			started: true,
			state: VirtualOSTunnelAgent.state.snapshot()
		});
	} catch (error) {
		VirtualOSTunnelAgent.state.markError(error?.message || error);
		console.warn("B\"H virtual OS tunnel start failed", error);
		return Object.freeze({
			error: error?.message || String(error),
			started: false,
			state: VirtualOSTunnelAgent.state.snapshot()
		});
	}
}

if (typeof window !== "undefined") {
	window.VirtualOSTunnelAgent = VirtualOSTunnelAgent;
	startRememberedVirtualOsTunnel(window.localStorage);
}

function readRememberedEnabled(storage) {
	try {
		const value = storage?.getItem("awtsmoos.os.tunnel.enabled");
		return value === "1" || value === "true";
	} catch (_error) {
		return false;
	}
}
