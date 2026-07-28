//B"H
// Boruch Hashem
// Blessed is He

import { ChromeDiscovery } from "./ChromeDiscovery.mjs";
import { CdpClient } from "./CdpClient.mjs";
import { OwnedHostInspector } from "./OwnedHostInspector.mjs";

/**
 * A fresh owned tab carries authenticated requests without destroying unrelated
 * user tabs. The Awtsmoos lets Awtsmoos.com activate only its own target so one
 * harmless native carrier can receive ordinary browser user activation.
 */
export class AuthenticatedSocketController {
	constructor({
		port = 9226,
		replaceChatGptTabs = false,
		inspectionIntervalMs = 350,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
	} = {}) {
		this.port = port;
		this.replaceChatGptTabs = replaceChatGptTabs;
		this.inspectionIntervalMs = inspectionIntervalMs;
		this.sleep = sleep;
	}

	async open(timeoutMs = 45000) {
		if (this.replaceChatGptTabs) {
			await this.closeChatGptTargets();
		}
		const target = await this.createTarget();
		const cdpClient = new CdpClient(target.webSocketDebuggerUrl);
		try {
			await cdpClient.connect();
			await cdpClient.send("Page.enable");
			await cdpClient.send("Page.navigate", { url: "https://chatgpt.com/" });
			const inspector = new OwnedHostInspector(cdpClient);
			const pageState = await this.waitUntilReady(inspector, timeoutMs);
			await this.activateTarget(target.id);
			await this.sleep(250);
			return {
				cdpClient,
				debugPort: this.port,
				inspector,
				pageState,
				targetId: target.id,
				close: () => this.close(target.id, cdpClient)
			};
		} catch (error) {
			await this.close(target.id, cdpClient);
			throw error;
		}
	}

	async waitUntilReady(inspector, timeoutMs) {
		const deadline = Date.now() + timeoutMs;
		let lastState = null;
		while (Date.now() < deadline) {
			try {
				lastState = await inspector.inspect();
				if (lastState.authenticated && lastState.composerVisible) {
					return lastState;
				}
			} catch {}
			await this.sleep(this.inspectionIntervalMs);
		}
		throw new Error(
			`Authenticated controller readiness timed out in ${lastState?.mode || "unknown"} mode.`
		);
	}

	async activateTarget(targetId) {
		const response = await fetch(
			`http://127.0.0.1:${this.port}/json/activate/${targetId}`
		);
		if (!response.ok) {
			throw new Error(`Could not activate authenticated controller: ${response.status}.`);
		}
	}

	async closeChatGptTargets() {
		const targets = await new ChromeDiscovery(this.port).listTargets();
		const chatTargets = targets.filter(target => {
			return target.type === "page" && target.url.includes("chatgpt.com");
		});
		await Promise.all(chatTargets.map(target => fetch(
			`http://127.0.0.1:${this.port}/json/close/${target.id}`
		).catch(() => null)));
		return chatTargets.length;
	}

	async createTarget() {
		const blank = encodeURIComponent("about:blank");
		const endpoint = `http://127.0.0.1:${this.port}/json/new?${blank}`;
		const response = await fetch(endpoint, { method: "PUT" });
		if (!response.ok) {
			throw new Error(`Could not create authenticated controller: ${response.status}.`);
		}
		return response.json();
	}

	async close(targetId, cdpClient) {
		cdpClient.close();
		await fetch(`http://127.0.0.1:${this.port}/json/close/${targetId}`).catch(() => null);
	}
}
