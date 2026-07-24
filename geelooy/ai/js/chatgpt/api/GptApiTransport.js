//B"H
// Boruch Hashem
// Blessed is He

/**
 * The HTTP vessel speaks only bounded JSON with the authenticated Awtsmoos.com
 * API. The Awtsmoos keeps parsing, status interpretation, and browser-handoff
 * detection separate from the higher-level GPT client and its local extension.
 */
export class GptApiTransport {
	constructor({ basePath = "/api/gpt", fetcher = globalThis.fetch?.bind(globalThis) } = {}) {
		if (typeof fetcher !== "function") {
			throw new TypeError("A browser fetch function is required.");
		}
		this.basePath = basePath.replace(/\/+$/, "");
		this.fetcher = fetcher;
	}

	async request(action, {
		method,
		payload = null,
		allowBrowserSignal = false
	}) {
		const options = {
			method,
			credentials: "include",
			cache: "no-store",
			headers: { "Content-Type": "application/json" }
		};
		if (payload) options.body = JSON.stringify(payload);
		const response = await this.fetcher(`${this.basePath}/${action}`, options);
		const text = await response.text();
		let body;
		try {
			body = JSON.parse(text || "{}");
		} catch {
			throw gptApiError("GPT_API_JSON_INVALID", "GPT API returned invalid JSON.");
		}
		body = body?.response ?? body;
		if (response.ok || (allowBrowserSignal && isBrowserSignal(body))) {
			return body;
		}
		throw gptApiError(
			body?.error?.code || body?.error || "GPT_API_REQUEST_FAILED",
			body?.error?.message || body?.safeHint || "GPT API request failed."
		);
	}
}

export function isBrowserSignal(value) {
	return value?.transport === "browser-extension"
		&& (value?.error?.code === "GPT_BROWSER_RELAY_REQUIRED"
			|| value?.clientExecutionRequired === true);
}

export function gptApiError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}
