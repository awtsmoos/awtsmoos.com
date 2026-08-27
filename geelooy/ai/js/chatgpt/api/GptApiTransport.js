//B"H
// Boruch Hashem
// Blessed is He

import { RequestAbortScope } from "./RequestAbortScope.js";

const DEFAULT_FETCHER = globalThis.fetch?.bind(globalThis);

/**
 * Bounded JSON crosses the authenticated Awtsmoos.com gate while prompts remain
 * absent from public discovery. The Awtsmoos closes every timer and abort listener
 * after success, failure, timeout, or cancellation.
 */
export class GptApiTransport {
	constructor({ basePath = "/api/gpt", fetcher = DEFAULT_FETCHER, timeoutMs = 15000 } = {}) {
		if (typeof fetcher !== "function") {
			throw new TypeError("A browser fetch function is required.");
		}
		this.basePath = basePath.replace(/\/+$/, "");
		this.fetcher = fetcher;
		this.timeoutMs = timeoutMs;
		this.cacheIdentity = fetcher;
	}

	async request(action, {
		method,
		payload = null,
		allowBrowserSignal = false,
		signal = null,
		timeoutMs = this.timeoutMs
	}) {
		const scope = new RequestAbortScope({ signal, timeoutMs });
		const options = {
			method,
			credentials: "include",
			cache: "no-store",
			headers: { "Content-Type": "application/json" },
			signal: scope.signal
		};
		if (payload !== null) {
			options.body = JSON.stringify(payload);
		}
		try {
			const response = await this.fetcher(`${this.basePath}/${action}`, options);
			const body = await this.parse(response);
			if (response.ok || (allowBrowserSignal && isBrowserSignal(body))) {
				return body;
			}
			throw gptApiError(
				body?.error?.code || body?.error || "GPT_API_REQUEST_FAILED",
				body?.error?.message || body?.safeHint || "GPT API request failed."
			);
		} catch (error) {
			if (scope.code === "GPT_API_TIMEOUT") {
				throw gptApiError(scope.code, "GPT API request timed out.");
			}
			if (scope.code === "GPT_API_ABORTED") {
				throw gptApiError(scope.code, "GPT API request was cancelled.");
			}
			throw error;
		} finally {
			scope.close();
		}
	}

	async parse(response) {
		const text = await response.text();
		try {
			const body = JSON.parse(text || "{}");
			return body?.response ?? body;
		} catch {
			throw gptApiError("GPT_API_JSON_INVALID", "GPT API returned invalid JSON.");
		}
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
