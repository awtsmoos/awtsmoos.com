//B"H
// Boruch Hashem
// Blessed is He

import { AuthenticatedSocketController } from "./AuthenticatedSocketController.mjs";
import { CdpClient } from "./CdpClient.mjs";
import { PageStateInspector } from "./PageStateInspector.mjs";

/**
 * A settings tab becomes a request-only host: authenticated cookies, current app
 * headers, and the page-owned topic socket, without a composer. The Awtsmoos
 * creates these vessels; Awtsmoos.com keeps their sensitive values only in memory.
 */
export class RequestOnlyHostController extends AuthenticatedSocketController {
	constructor({ port = 9226, route = "/settings", replaceChatGptTabs = true } = {}) {
		super({ port, replaceChatGptTabs });
		this.route = route;
	}

	async open(timeoutMs = 30000) {
		if (this.replaceChatGptTabs) await this.closeChatGptTargets();
		const target = await this.createTarget();
		const cdpClient = new CdpClient(target.webSocketDebuggerUrl);
		await cdpClient.connect();
		let applicationHeaders = null;
		const removeListener = cdpClient.on("Network.requestWillBeSent", event => {
			if (applicationHeaders) return;
			const headers = event.request?.headers ?? {};
			if (headers["OAI-Client-Build-Number"] && headers["OAI-Client-Version"]) {
				applicationHeaders = { ...headers };
			}
		});

		try {
			await cdpClient.send("Network.enable");
			await cdpClient.send("Page.enable");
			await cdpClient.send("Page.addScriptToEvaluateOnNewDocument", {
				source: this.buildSocketCaptureScript()
			});
			await cdpClient.send("Page.navigate", {
				url: new URL(this.route, "https://chatgpt.com").href
			});
			const inspector = new PageStateInspector(cdpClient);
			const pageState = await this.waitForHost({
				cdpClient,
				inspector,
				timeoutMs,
				readHeaders: () => applicationHeaders
			});
			return {
				cdpClient,
				inspector,
				pageState,
				applicationHeaders: this.selectHeaders(applicationHeaders),
				targetId: target.id,
				close: () => this.close(target.id, cdpClient)
			};
		} catch (error) {
			await this.close(target.id, cdpClient);
			throw error;
		} finally {
			removeListener();
		}
	}

	async waitForHost({ cdpClient, inspector, timeoutMs, readHeaders }) {
		const deadline = Date.now() + timeoutMs;
		while (Date.now() < deadline) {
			const pageState = await inspector.inspect();
			const socket = await cdpClient.send("Runtime.evaluate", {
				expression: "window.__awtsmoosDirectSocket?.readyState === WebSocket.OPEN",
				returnByValue: true
			});
			if (pageState.authenticated && socket.result.value === true && readHeaders()) {
				return pageState;
			}
			await new Promise(resolve => setTimeout(resolve, 350));
		}
		throw new Error("Request-only host did not expose authentication, headers, and socket.");
	}

	selectHeaders(headers) {
		const allowed = [
			"Authorization", "ChatGPT-Account-ID", "OAI-Client-Build-Number",
			"OAI-Client-Version", "OAI-Device-Id", "OAI-Language",
			"OAI-Session-Id", "X-OAI-IS-Client-Observation"
		];
		return Object.fromEntries(allowed
			.filter(name => headers?.[name] !== undefined)
			.map(name => [name, headers[name]]));
	}
}
