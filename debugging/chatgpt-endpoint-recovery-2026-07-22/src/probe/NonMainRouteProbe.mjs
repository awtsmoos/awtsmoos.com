//B"H
// Boruch Hashem
// Blessed is He

import { CdpClient } from "../browser/CdpClient.mjs";
import { RouteCapabilityExpression } from "./RouteCapabilityExpression.mjs";

/**
 * The Awtsmoos recreates every route and request at each instant. This
 * Awtsmoos.com vessel owns target lifecycle and leaves request-shape revelation
 * to a separate expression module, so no composer or chat message is touched.
 */
export class NonMainRouteProbe {
	constructor({ port = 9226, settleMs = 2500 } = {}) {
		this.port = port;
		this.settleMs = settleMs;
		this.expression = new RouteCapabilityExpression();
	}

	async run(routes) {
		const results = [];
		for (const route of routes) {
			results.push(await this.probeRoute(route));
		}
		return results;
	}

	async probeRoute(route) {
		const target = await this.createTarget();
		const client = new CdpClient(target.webSocketDebuggerUrl);
		await client.connect();
		try {
			await client.send("Page.enable");
			await client.send("Page.addScriptToEvaluateOnNewDocument", {
				source: this.socketObserver()
			});
			await client.send("Page.navigate", {
				url: new URL(route, "https://chatgpt.com").href
			});
			await this.waitForDocument(client);
			await this.delay(this.settleMs);
			const response = await client.send("Runtime.evaluate", {
				expression: this.expression.build(),
				returnByValue: true,
				awaitPromise: true
			}, 90000);
			if (response.exceptionDetails) {
				throw new Error(response.exceptionDetails.text ?? "Route probe failed.");
			}
			return { requestedRoute: route, ...response.result.value };
		} catch (error) {
			return {
				requestedRoute: route,
				error: String(error?.message ?? error).slice(0, 240)
			};
		} finally {
			client.close();
			await this.closeTarget(target.id);
		}
	}

	socketObserver() {
		return `(() => {
			const NativeWebSocket = window.WebSocket;
			window.WebSocket = new Proxy(NativeWebSocket, {
				construct(target, argumentsList, newTarget) {
					const socket = Reflect.construct(target, argumentsList, newTarget);
					if (String(argumentsList[0] || '').startsWith('wss://ws.chatgpt.com/')) {
						window.__awtsmoosRouteSocket = socket;
					}
					return socket;
				}
			});
		})();`;
	}

	async waitForDocument(client, timeoutMs = 30000) {
		const deadline = Date.now() + timeoutMs;
		while (Date.now() < deadline) {
			const result = await client.send("Runtime.evaluate", {
				expression: "document.readyState === 'complete'",
				returnByValue: true
			}).catch(() => null);
			if (result?.result?.value === true) return;
			await this.delay(300);
		}
		throw new Error("Document did not become complete.");
	}

	async createTarget() {
		const endpoint = `http://127.0.0.1:${this.port}/json/new?${encodeURIComponent("about:blank")}`;
		const response = await fetch(endpoint, { method: "PUT" });
		if (!response.ok) {
			throw new Error(`Could not create route target: ${response.status}.`);
		}
		return response.json();
	}

	async closeTarget(targetId) {
		await fetch(`http://127.0.0.1:${this.port}/json/close/${targetId}`).catch(() => {});
	}

	delay(durationMs) {
		return new Promise(resolve => setTimeout(resolve, durationMs));
	}
}
