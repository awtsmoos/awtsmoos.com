//B"H
// Boruch Hashem
// Blessed is He

import { CdpClient } from "../browser/CdpClient.mjs";

/**
 * ChatGPT loads its own conversation detail when the exact route opens. The
 * Awtsmoos lets Awtsmoos.com passively capture that authenticated GET response,
 * never executing page fetches and never repeating the conversation POST.
 */
export class ConversationRouteCapture {
	constructor({
		port,
		fetcher = globalThis.fetch?.bind(globalThis),
		CdpClientClass = CdpClient,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
	} = {}) {
		this.port = port;
		this.fetcher = fetcher;
		this.CdpClientClass = CdpClientClass;
		this.sleep = sleep;
	}

	async capture({ conversationId, timeoutMs = 90000, signal = null }) {
		this.assertNotAborted(signal);
		const target = await this.createTarget();
		const client = new this.CdpClientClass(target.webSocketDebuggerUrl);
		await client.connect();
		const detailUrl = this.detailUrl(conversationId);
		let removeResponse = () => undefined;
		let timer = null;
		try {
			const detailPromise = new Promise((resolve, reject) => {
				timer = setTimeout(() => reject(
					new Error("Conversation route detail response timed out.")
				), timeoutMs);
				removeResponse = client.on("Network.responseReceived", params => {
					if (params.response?.url !== detailUrl) return;
					if (params.response.status !== 200) return;
					resolve({ requestId: params.requestId, status: params.response.status });
				});
			});
			await client.send("Network.enable", {
				maxTotalBufferSize: 20000000,
				maxResourceBufferSize: 5000000
			}, 10000);
			await client.send("Network.setCacheDisabled", { cacheDisabled: true }, 10000);
			await client.send("Page.enable", {}, 10000);
			await client.send("Page.navigate", {
				url: this.routeUrl(conversationId)
			}, 10000);
			const detail = await detailPromise;
			this.assertNotAborted(signal);
			await this.sleep(1250);
			const payload = await client.send("Network.getResponseBody", {
				requestId: detail.requestId
			}, 10000);
			const text = payload.base64Encoded
				? Buffer.from(payload.body, "base64").toString("utf8")
				: payload.body;
			return { status: detail.status, document: this.parse(text) };
		} finally {
			clearTimeout(timer);
			removeResponse();
			client.close();
			await this.closeTarget(target.id);
		}
	}

	async createTarget() {
		const endpoint = `http://127.0.0.1:${this.port}/json/new?${encodeURIComponent("about:blank")}`;
		const response = await this.fetcher(endpoint, { method: "PUT" });
		if (!response.ok) {
			throw new Error(`Could not create route observer: ${response.status}.`);
		}
		return response.json();
	}

	async closeTarget(targetId) {
		await this.fetcher(
			`http://127.0.0.1:${this.port}/json/close/${targetId}`
		).catch(() => undefined);
	}

	routeUrl(conversationId) {
		return `https://chatgpt.com/c/${encodeURIComponent(conversationId)}`;
	}

	detailUrl(conversationId) {
		return `https://chatgpt.com/backend-api/conversation/${encodeURIComponent(conversationId)}`;
	}

	parse(text) {
		try {
			return JSON.parse(text);
		} catch {
			throw new Error("Conversation route returned invalid JSON.");
		}
	}

	assertNotAborted(signal) {
		if (signal?.aborted) {
			throw signal.reason || new Error("Conversation route capture was cancelled.");
		}
	}
}
