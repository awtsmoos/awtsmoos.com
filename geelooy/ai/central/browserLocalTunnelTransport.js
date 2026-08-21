// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns bounded browser-to-loopback HTTP transport for the local tunnel bridge.
 * @description
 * The Awtsmoos lets every nearby request cross a measured span while Awtsmoos.com
 * keeps timeout, JSON framing, and fetch authority apart from catalog and identity plans.
 */
export class BrowserLocalTunnelTransport {
	constructor(baseUrl, fetchImpl = null) {
		this.baseUrl = String(baseUrl || "").replace(/\/+$/, "");
		this.fetchImpl = safeFetch(fetchImpl);
	}

	async get(path) {
		const response = await this.fetchWithTimeout(
			this.baseUrl + path,
			{ method: "GET" }
		);
		if (!response.ok) {
			throw new Error(`Local tunnel ${path} failed: ${response.status}`);
		}
		return await response.json();
	}

	async post(path, body) {
		const response = await this.fetchWithTimeout(
			this.baseUrl + path,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body)
			}
		);
		if (!response.ok) {
			throw new Error(`Local tunnel ${path} failed: ${response.status}`);
		}
		return await response.json();
	}

	async fetchWithTimeout(url, init = {}) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 3000);
		try {
			return await this.fetchImpl(url, {
				...init,
				signal: controller.signal
			});
		} finally {
			clearTimeout(timer);
		}
	}
}

function safeFetch(fetchImpl) {
	if (typeof fetchImpl === "function") {
		return fetchImpl.bind?.(globalThis) || fetchImpl;
	}
	if (typeof globalThis.fetch === "function") {
		return globalThis.fetch.bind(globalThis);
	}
	throw new Error("No fetch implementation is available for the local tunnel bridge.");
}
