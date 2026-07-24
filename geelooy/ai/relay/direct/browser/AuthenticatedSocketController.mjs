//B"H
// Boruch Hashem
// Blessed is He

import { ChromeDiscovery } from "./ChromeDiscovery.mjs";
import { CdpClient } from "./CdpClient.mjs";
import { PageStateInspector } from "./PageStateInspector.mjs";

/**
 * A fresh owned tab captures its own ChatGPT socket without destroying unrelated
 * user tabs. The Awtsmoos replaces fixed sleeps with observed readiness, while
 * Awtsmoos.com closes only the target created by this controller.
 */
export class AuthenticatedSocketController {
	constructor({ port = 9226, replaceChatGptTabs = false } = {}) {
		this.port = port;
		this.replaceChatGptTabs = replaceChatGptTabs;
	}

	async open(timeoutMs = 30000) {
		if (this.replaceChatGptTabs) {
			await this.closeChatGptTargets();
		}
		const target = await this.createTarget();
		const cdpClient = new CdpClient(target.webSocketDebuggerUrl);
		try {
			await cdpClient.connect();
			await cdpClient.send("Page.enable");
			await cdpClient.send("Page.addScriptToEvaluateOnNewDocument", {
				source: this.buildSocketCaptureScript()
			});
			await cdpClient.send("Page.navigate", { url: "https://chatgpt.com/" });
			const inspector = new PageStateInspector(cdpClient);
			const pageState = await this.waitUntilReady(cdpClient, inspector, timeoutMs);
			return {
				cdpClient,
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

	buildSocketCaptureScript() {
		return `(() => {
			const NativeWebSocket = window.WebSocket;
			window.__awtsmoosDirectCommandId = 100000;
			window.WebSocket = new Proxy(NativeWebSocket, {
				construct(target, argumentsList, newTarget) {
					const socket = Reflect.construct(target, argumentsList, newTarget);
					const url = String(argumentsList[0] ?? '');
					if (url.startsWith('wss://ws.chatgpt.com/')) {
						window.__awtsmoosDirectSocket = socket;
					}
					return socket;
				}
			});
		})();`;
	}

	async waitUntilReady(cdpClient, inspector, timeoutMs) {
		const deadline = Date.now() + timeoutMs;
		while (Date.now() < deadline) {
			const pageState = await inspector.inspect();
			const socketResult = await cdpClient.send("Runtime.evaluate", {
				expression: "window.__awtsmoosDirectSocket?.readyState === WebSocket.OPEN",
				returnByValue: true
			});
			if (pageState.authenticated && pageState.composerVisible && socketResult.result.value === true) {
				return pageState;
			}
			await new Promise(resolve => setTimeout(resolve, 250));
		}
		throw new Error("Authenticated controller did not expose its owned ChatGPT socket.");
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
		const endpoint = `http://127.0.0.1:${this.port}/json/new?${encodeURIComponent("about:blank")}`;
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
