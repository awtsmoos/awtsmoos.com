//B"H
// Boruch Hashem
// Blessed is He

import { OpenAiCredentialResolver } from "./OpenAiCredentialResolver.mjs";
import { OpenAiResponsesBody } from "./OpenAiResponsesBody.mjs";
import { OpenAiResponsesParser } from "./OpenAiResponsesParser.mjs";

/**
 * Native fetch is the complete transport: one Bearer-authenticated POST to the
 * official Responses API, no Chrome and no DOM. The Awtsmoos resolves the key
 * server-side and erases timeout and caller-abort listeners on every outcome.
 */
export class OpenAiResponsesClient {
	constructor({
		fetchImpl = globalThis.fetch,
		endpoint = "https://api.openai.com/v1/responses",
		credentialResolver = new OpenAiCredentialResolver(),
		apiKeyResolver = null,
		bodyBuilder = new OpenAiResponsesBody(),
		parser = new OpenAiResponsesParser()
	} = {}) {
		this.fetchImpl = fetchImpl;
		this.endpoint = endpoint;
		this.credentialResolver = credentialResolver;
		this.injectedApiKeyResolver = apiKeyResolver;
		this.apiKeyResolver = apiKeyResolver ?? (() => credentialResolver.resolve());
		this.bodyBuilder = bodyBuilder;
		this.parser = parser;
	}

	configured() {
		return Boolean(this.apiKey());
	}

	credentialStatus() {
		if (this.injectedApiKeyResolver) {
			const configured = this.configured();
			return { configured, source: configured ? "injected" : "missing" };
		}
		return this.credentialResolver.describe();
	}

	async send(options) {
		const apiKey = this.apiKey();
		if (!apiKey) {
			const error = new Error("OpenAI API credential is required for request-only chat.");
			error.code = "official_api_key_required";
			throw error;
		}
		const timeoutMs = Number(options.timeoutMs || 180000);
		const controller = new AbortController();
		const timeout = setTimeout(() => {
			controller.abort(new Error("Official Responses API request timed out."));
		}, timeoutMs);
		const abort = () => controller.abort(
			options.signal?.reason || new Error("Official API request was cancelled.")
		);
		options.signal?.addEventListener("abort", abort, { once: true });
		const startedAt = Date.now();
		try {
			const response = await this.fetchImpl(this.endpoint, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(this.bodyBuilder.build(options)),
				signal: controller.signal
			});
			const value = await this.readJson(response);
			if (!response.ok) throw this.upstreamError(response.status, value);
			return {
				...this.parser.parse(value, response.status),
				requestLatencyMs: Date.now() - startedAt
			};
		} finally {
			clearTimeout(timeout);
			options.signal?.removeEventListener("abort", abort);
		}
	}

	apiKey() {
		const value = this.apiKeyResolver();
		return typeof value === "string" ? value.trim() : "";
	}

	async readJson(response) {
		const text = await response.text();
		try {
			return JSON.parse(text || "{}");
		} catch {
			throw this.upstreamError(response.status, null);
		}
	}

	upstreamError(status, value) {
		const error = new Error("Official Responses API request failed.");
		error.code = "official_api_request_failed";
		error.httpStatus = status;
		error.providerType = typeof value?.error?.type === "string"
			? value.error.type
			: null;
		return error;
	}
}
