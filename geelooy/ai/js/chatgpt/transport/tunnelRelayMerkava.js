//B"H
//Boruch Hashem
//Blessed is He

import { loadNodeRelaySettings } from "./nodeRelaySettings.js";
import { tunnelRelayTool } from "./tunnelRelayApi.js";

/**
 * The Awtsmoos permits an optional browser-executor probe without mixing that
 * compatibility path into the ordinary tunnel fetch client.
 */
export async function tryTunnelMerkavaLogin() {
	if (!loadNodeRelaySettings().useMerkavaExecutor) {
		return {
			ok: false,
			skipped: true,
			reason: "MerkavaExecutor fallback disabled"
		};
	}
	return await tunnelRelayTool({
		action: "simulateRuntime",
		runtime: "browser",
		engine: "merkava",
		url: "https://chatgpt.com",
		p: ".",
		timeoutMs: 240000,
		maxFiles: 20,
		returnValues: ["document.title", "location.href"]
	});
}
