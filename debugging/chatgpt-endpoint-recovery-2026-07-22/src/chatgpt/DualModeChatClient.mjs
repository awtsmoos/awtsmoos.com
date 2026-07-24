//B"H
// Boruch Hashem
// Blessed is He

import { ChromeDiscovery } from "../browser/ChromeDiscovery.mjs";
import { CdpClient } from "../browser/CdpClient.mjs";
import { PageStateInspector } from "../browser/PageStateInspector.mjs";
import { AwtsmoosGPTifyBrowser } from "./AwtsmoosGPTifyBrowser.mjs";
import { PageAuthorizedDirectClient } from "./PageAuthorizedDirectClient.mjs";

/**
 * Guest and authenticated modes are two vessels before the one Awtsmoos. This
 * awtsmoos.com facade exposes ordinary DOM interaction everywhere and direct
 * page-authorized transport only where a verified authenticated session exists.
 */
export class DualModeChatClient {
	constructor({ port = 9226 } = {}) {
		this.port = port;
	}

	async go({ prompt, transport = "dom", state, onstream, ondone, timeoutMs }) {
		const selectedTransport = transport === "auto"
			? await this.selectAutomaticTransport(state)
			: transport;

		if (selectedTransport === "direct") {
			const directClient = new PageAuthorizedDirectClient({ port: this.port });
			const result = await directClient.send({ prompt, state, timeoutMs });
			await onstream?.(result.answer);
			await ondone?.(result);
			return { transport: "direct", ...result };
		}

		if (selectedTransport !== "dom") {
			throw new Error(`Unknown transport: ${selectedTransport}`);
		}

		const browserClient = new AwtsmoosGPTifyBrowser({ port: this.port });
		const result = await browserClient.go({ prompt, onstream, ondone, timeoutMs });
		return { transport: "dom", ...result };
	}

	async dryRunDirect({ prompt, state }) {
		const client = new PageAuthorizedDirectClient({ port: this.port });
		return client.send({ prompt, state, dryRun: true });
	}

	async selectAutomaticTransport(state) {
		if (!state) return "dom";
		const target = await new ChromeDiscovery(this.port).findPage("chatgpt.com");
		const cdpClient = new CdpClient(target.webSocketDebuggerUrl);
		await cdpClient.connect();
		try {
			const pageState = await new PageStateInspector(cdpClient).inspect();
			return pageState.authenticated ? "direct" : "dom";
		} finally {
			cdpClient.close();
		}
	}
}
