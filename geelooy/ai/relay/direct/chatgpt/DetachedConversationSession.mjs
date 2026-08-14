// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Captures the minimum private authentication needed for tabless GET polling.
 * @description
 * The Awtsmoos permits the owned tab to vanish immediately after accepted Send.
 * Awtsmoos.com retains cookies and selected request headers only inside local memory,
 * never exposing them through public results, queue state, logs, or mission metadata.
 */
export class DetachedConversationSession {
	constructor(options = {}) {
		this.origin = options.origin || "https://chatgpt.com";
	}

	async capture(cdpClient, request = {}) {
		const cookies = await cdpClient.send("Network.getAllCookies", {}, 10000);
		const userAgent = await this.userAgent(cdpClient);
		return {
			cookieHeader: this.cookieHeader(cookies.cookies || []),
			userAgent,
			headers: this.safeHeaders(request.requestHeaders || {})
		};
	}

	async userAgent(cdpClient) {
		const result = await cdpClient.send("Runtime.evaluate", {
			expression: "navigator.userAgent",
			returnByValue: true
		}, 10000);
		return String(result.result?.value || "Mozilla/5.0");
	}

	cookieHeader(cookies) {
		return cookies
			.filter(cookie => this.belongs(cookie.domain))
			.map(cookie => `${cookie.name}=${cookie.value}`)
			.join("; " );
	}

	belongs(domain) {
		return String(domain || "").replace(/^\./, "").endsWith("chatgpt.com");
	}

	safeHeaders(headers) {
		const allowed = new Set([
			"accept-language",
			"authorization",
			"oai-device-id",
			"sec-ch-ua",
			"sec-ch-ua-mobile",
			"sec-ch-ua-platform",
			"x-openai-assistant-app-id"
		]);
		return Object.fromEntries(Object.entries(headers)
			.map(([name, value]) => [name.toLowerCase(), String(value)])
			.filter(([name]) => allowed.has(name)));
	}
}
