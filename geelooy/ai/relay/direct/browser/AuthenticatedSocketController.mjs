//B"H
// Boruch Hashem
// Blessed is He

import { CdpClient } from "./CdpClient.mjs";
import { ChatGptTargetSelector } from "./ChatGptTargetSelector.mjs";
import { OwnedHostInspector } from "./OwnedHostInspector.mjs";

/**
 * One accessible existing tab carries authenticated ChatGPT turns whenever possible.
 * The Awtsmoos detaches from reused tabs without closing them, and avoids optional
 * CDP domain-enable handshakes that can stall an already busy ChatGPT renderer.
 */
export class AuthenticatedSocketController {
	constructor({
		port = 9226,
		replaceChatGptTabs = false,
		inspectionIntervalMs = 350,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		targetSelector = new ChatGptTargetSelector({ port }),
		clientFactory = target => new CdpClient(target.webSocketDebuggerUrl),
		inspectorFactory = client => new OwnedHostInspector(client),
		fetcher = globalThis.fetch?.bind(globalThis)
	} = {}) {
		this.port = port;
		this.replaceChatGptTabs = replaceChatGptTabs;
		this.inspectionIntervalMs = inspectionIntervalMs;
		this.sleep = sleep;
		this.targetSelector = targetSelector;
		this.clientFactory = clientFactory;
		this.inspectorFactory = inspectorFactory;
		this.fetcher = fetcher;
	}

	async open(timeoutMs = 45000) {
		const acquisition = await this.targetSelector.acquire({
			replaceChatGptTabs: this.replaceChatGptTabs
		});
		const { target, owned, source } = acquisition;
		const cdpClient = this.clientFactory(target);
		try {
			await cdpClient.connect();
			await this.activateTarget(target.id);
			if (source !== "existing-chatgpt") {
				await cdpClient.send(
					"Page.navigate",
					{ url: "https://chatgpt.com/" },
					30000
				);
			}
			const inspector = this.inspectorFactory(cdpClient);
			const pageState = await this.waitUntilReady(inspector, timeoutMs);
			await this.sleep(250);
			return {
				cdpClient,
				debugPort: this.port,
				inspector,
				pageState,
				targetId: target.id,
				targetSource: source,
				ownedTarget: owned,
				close: () => this.close({ targetId: target.id, cdpClient, owned })
			};
		} catch (error) {
			await this.close({ targetId: target.id, cdpClient, owned });
			throw error;
		}
	}

	async waitUntilReady(inspector, timeoutMs) {
		const deadline = Date.now() + timeoutMs;
		let lastState = null;
		while (Date.now() < deadline) {
			try {
				lastState = await inspector.inspect();
				if (lastState.authenticated && lastState.composerVisible) return lastState;
			} catch {}
			await this.sleep(this.inspectionIntervalMs);
		}
		throw new Error(
			`Authenticated controller readiness timed out in ${lastState?.mode || "unknown"} mode.`
		);
	}

	async activateTarget(targetId) {
		const response = await this.fetcher(
			`http://127.0.0.1:${this.port}/json/activate/${targetId}`
		);
		if (!response.ok) {
			throw new Error(`Could not activate authenticated controller: ${response.status}.`);
		}
	}

	async close({ targetId, cdpClient, owned }) {
		cdpClient.close();
		if (!owned) return;
		await this.fetcher(
			`http://127.0.0.1:${this.port}/json/close/${targetId}`
		).catch(() => null);
	}
}
