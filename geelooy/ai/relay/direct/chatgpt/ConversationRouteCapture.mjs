//B"H
// Boruch Hashem
// Blessed is He

import { CdpClient } from "../browser/CdpClient.mjs";

/**
 * The Awtsmoos lets the existing ChatGPT page reveal its authenticated conversation
 * GET while Awtsmoos.com pauses only that response long enough to read its body.
 * No tab is created, no script is evaluated, and no conversation POST can repeat.
 */
export class ConversationRouteCapture {
	constructor({
		port,
		fetcher = globalThis.fetch?.bind(globalThis),
		CdpClientClass = CdpClient
	} = {}) {
		this.port = port;
		this.fetcher = fetcher;
		this.CdpClientClass = CdpClientClass;
	}

	async capture({ conversationId, timeoutMs = 90000, signal = null }) {
		this.assertNotAborted(signal);
		const target = await this.conversationTarget(conversationId);
		const client = new this.CdpClientClass(target.webSocketDebuggerUrl);
		await client.connect();
		let removePaused = () => undefined;
		let timer = null;
		try {
			await client.send("Fetch.enable", {
				patterns: [{
					urlPattern: "*backend-api*conversation*",
					requestStage: "Response"
				}]
			}, 10000);
			const captured = new Promise((resolve, reject) => {
				timer = setTimeout(() => reject(new Error("Conversation GET interception timed out.")), timeoutMs);
				removePaused = client.on("Fetch.requestPaused", parameters => {
					void this.handlePaused(client, parameters, conversationId, resolve);
				});
			});
			if (this.matchesTarget(target, conversationId)) {
				await client.send("Page.reload", { ignoreCache: true }, 20000);
			} else {
				await client.send("Page.navigate", {
					url: `https://chatgpt.com/c/${encodeURIComponent(conversationId)}`
				}, 20000);
			}
			const response = await captured;
			this.assertNotAborted(signal);
			return response;
		} finally {
			clearTimeout(timer);
			removePaused();
			await client.send("Fetch.disable", {}, 10000).catch(() => undefined);
			client.close();
		}
	}

	async handlePaused(client, parameters, conversationId, resolve) {
		const requestId = parameters.requestId;
		const matches = this.matches(parameters, conversationId);
		if (!matches) {
			await client.send("Fetch.continueRequest", { requestId }, 10000).catch(() => undefined);
			return;
		}
		try {
			const body = await client.send("Fetch.getResponseBody", { requestId }, 10000);
			const text = body.base64Encoded
				? Buffer.from(body.body, "base64").toString("utf8")
				: body.body;
			resolve({
				status: parameters.responseStatusCode,
				document: this.parse(text)
			});
		} finally {
			await client.send("Fetch.continueResponse", { requestId }, 10000).catch(async () => {
				await client.send("Fetch.continueRequest", { requestId }, 10000).catch(() => undefined);
			});
		}
	}

	matches(parameters, conversationId) {
		if (parameters.responseStatusCode !== 200) return false;
		const url = String(parameters.request?.url ?? "");
		return url.includes("backend-api") && url.includes(conversationId);
	}

	async conversationTarget(conversationId) {
		const response = await this.fetcher(`http://127.0.0.1:${this.port}/json/list`);
		if (!response.ok) throw new Error(`Chrome target inventory failed: ${response.status}.`);
		const targets = await response.json();
		const pages = targets.filter(entry => entry.type === "page" && entry.webSocketDebuggerUrl);
		const target = pages.find(entry => this.matchesTarget(entry, conversationId))
			|| pages.find(entry => {
				try { return new URL(entry.url).hostname === "chatgpt.com"; }
				catch { return false; }
			});
		if (!target?.webSocketDebuggerUrl) throw new Error("The visible ChatGPT conversation target was unavailable.");
		return target;
	}

	matchesTarget(target, conversationId) {
		try {
			const segments = new URL(target.url).pathname.split("/").filter(Boolean);
			const index = segments.lastIndexOf("c");
			return index >= 0 && segments[index + 1] === conversationId;
		} catch {
			return false;
		}
	}

	parse(text) {
		try {
			return JSON.parse(text);
		} catch {
			throw new Error("Conversation GET returned invalid JSON.");
		}
	}

	assertNotAborted(signal) {
		if (signal?.aborted) throw signal.reason || new Error("Conversation GET was cancelled.");
	}
}
