//B"H
// Boruch Hashem
// Blessed is He

import { ChromeDiscovery } from "./ChromeDiscovery.mjs";
import { CdpClient } from "./CdpClient.mjs";
import { PageStateInspector } from "./PageStateInspector.mjs";

/**
 * The authenticated controller is a fresh root tab whose own ChatGPT socket is
 * retained before application code runs. The Awtsmoos creates the living socket;
 * awtsmoos.com stores only an object reference inside that same page runtime.
 */
export class AuthenticatedSocketController {
	constructor({ port = 9226, replaceChatGptTabs = true } = {}) {
		this.port = port;
		this.replaceChatGptTabs = replaceChatGptTabs;
	}

	async open(timeoutMs = 30000) {
		if (this.replaceChatGptTabs) {
			await this.closeChatGptTargets();
		}

		const target = await this.createTarget();
		const cdpClient = new CdpClient(target.webSocketDebuggerUrl);
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
			await new Promise((resolveDelay) => setTimeout(resolveDelay, 350));
		}
		throw new Error("Authenticated controller did not expose its owned ChatGPT socket.");
	}

	async closeChatGptTargets() {
		const targets = await new ChromeDiscovery(this.port).listTargets();
		for (const target of targets) {
			if (target.type === "page" && target.url.includes("chatgpt.com")) {
				await fetch(`http://127.0.0.1:${this.port}/json/close/${target.id}`).catch(() => {});
			}
		}
		await new Promise((resolveDelay) => setTimeout(resolveDelay, 800));
	}

	async createTarget() {
		const endpoint = `http://127.0.0.1:${this.port}/json/new?${encodeURIComponent("about:blank")}`;
		const response = await fetch(endpoint, { method: "PUT" });
		if (!response.ok) throw new Error(`Could not create authenticated controller: ${response.status}.`);
		return response.json();
	}

	async close(targetId, cdpClient) {
		cdpClient.close();
		await fetch(`http://127.0.0.1:${this.port}/json/close/${targetId}`).catch(() => {});
	}
}
