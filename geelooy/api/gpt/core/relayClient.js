//B"H
// Boruch Hashem
// Blessed is He

const { resolveRelayBaseUrl } = require("./relayPolicy.js");

const ROUTES = Object.freeze({
	health: { method: "GET", path: "/direct-health" },
	capability: { method: "GET", path: "/direct-capability" },
	chat: { method: "POST", path: "/direct-chat" },
	reset: { method: "POST", path: "/direct-reset" }
});

/**
 * The old core injected one custom fetcher; this modern server collaborator keeps
 * the same clean seam. Awtsmoos.com receives bounded JSON from a loopback relay,
 * while credentials and raw upstream responses remain inside authenticated Chrome.
 */
class LocalDirectRelayClient {
	constructor({
		baseUrl = resolveRelayBaseUrl(),
		fetcher = globalThis.fetch,
		timeoutMs = 210000,
		maximumResponseBytes = 2 * 1024 * 1024
	} = {}) {
		this.baseUrl = baseUrl;
		this.fetcher = fetcher;
		this.timeoutMs = timeoutMs;
		this.maximumResponseBytes = maximumResponseBytes;
	}

	async invoke(action, payload = {}) {
		const route = ROUTES[action];
		if (!route) throw relayError("GPT_RELAY_ACTION_INVALID", "Unknown relay action.", 400);
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), this.timeoutMs);
		try {
			const options = {
				method: route.method,
				headers: { "Content-Type": "application/json" },
				signal: controller.signal
			};
			if (route.method !== "GET") options.body = JSON.stringify(payload);
			const response = await this.fetcher(`${this.baseUrl}${route.path}`, options);
			const text = await response.text();
			if (Buffer.byteLength(text) > this.maximumResponseBytes) {
				throw relayError("GPT_RELAY_RESPONSE_LIMIT", "GPT relay response exceeded two MiB.", 502);
			}
			let body;
			try {
				body = JSON.parse(text || "{}");
			} catch {
				throw relayError("GPT_RELAY_JSON_INVALID", "GPT relay returned invalid JSON.", 502);
			}
			return Object.freeze({ status: response.status, body });
		} catch (error) {
			if (error?.code) throw error;
			const aborted = error?.name === "AbortError";
			throw relayError(
				aborted ? "GPT_RELAY_TIMEOUT" : "GPT_RELAY_UNAVAILABLE",
				aborted ? "GPT relay timed out." : "GPT relay is unavailable.",
				503
			);
		} finally {
			clearTimeout(timer);
		}
	}
}

function relayError(code, message, status) {
	const error = new Error(message);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = { LocalDirectRelayClient, ROUTES };
