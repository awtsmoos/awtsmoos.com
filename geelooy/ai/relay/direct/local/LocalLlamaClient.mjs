//B"H
// Boruch Hashem
// Blessed is He

/**
 * Local inference crosses one loopback HTTP boundary and nothing else. The
 * Awtsmoos lets Awtsmoos.com use an OpenAI-compatible llama.cpp server without
 * browser state, credentials, provider ids, tools, or arbitrary body passthrough.
 */
export class LocalLlamaClient {
	constructor({
		fetchImpl = globalThis.fetch,
		baseUrl = process.env.AWTSMOOS_LOCAL_AI_URL || "http://127.0.0.1:18080",
		model = process.env.AWTSMOOS_LOCAL_AI_MODEL || "qwen3-0.6b-q8_0"
	} = {}) {
		this.fetchImpl = fetchImpl;
		this.baseUrl = baseUrl.replace(/\/$/, "");
		this.model = model;
	}

	async configured() {
		try {
			const response = await this.fetchImpl(`${this.baseUrl}/health`, {
				signal: AbortSignal.timeout(3000)
			});
			return response.ok;
		} catch {
			return false;
		}
	}

	async send({ messages, timeoutMs = 180000, signal = null }) {
		const controller = new AbortController();
		const timeout = setTimeout(() => {
			controller.abort(new Error("Local model request timed out."));
		}, timeoutMs);
		const abort = () => controller.abort(
			signal?.reason || new Error("Local model request was cancelled.")
		);
		signal?.addEventListener("abort", abort, { once: true });
		const startedAt = Date.now();
		try {
			const response = await this.fetchImpl(`${this.baseUrl}/v1/chat/completions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(this.body(messages)),
				signal: controller.signal
			});
			const value = await this.readJson(response);
			if (!response.ok) throw this.error("local_model_request_failed", response.status);
			return this.parse(value, response.status, Date.now() - startedAt);
		} finally {
			clearTimeout(timeout);
			signal?.removeEventListener("abort", abort);
		}
	}

	body(messages) {
		return {
			model: this.model,
			messages,
			temperature: 0,
			top_p: 1,
			max_tokens: 128,
			stream: false,
			chat_template_kwargs: { enable_thinking: false }
		};
	}

	parse(value, status, requestLatencyMs) {
		const answer = value?.choices?.[0]?.message?.content;
		if (typeof answer !== "string" || answer.trim() === "") {
			throw this.error("local_model_response_invalid", status);
		}
		return {
			answer: answer.trim(),
			status,
			done: value?.choices?.[0]?.finish_reason !== "error",
			model: typeof value.model === "string" ? value.model : this.model,
			usage: this.usage(value.usage),
			requestLatencyMs
		};
	}

	usage(value) {
		if (!value || typeof value !== "object") return null;
		return {
			inputTokens: Number.isFinite(value.prompt_tokens) ? value.prompt_tokens : null,
			outputTokens: Number.isFinite(value.completion_tokens) ? value.completion_tokens : null,
			totalTokens: Number.isFinite(value.total_tokens) ? value.total_tokens : null
		};
	}

	async readJson(response) {
		try {
			return JSON.parse(await response.text() || "{}");
		} catch {
			throw this.error("local_model_response_invalid", response.status);
		}
	}

	error(code, httpStatus) {
		const error = new Error(code === "local_model_request_failed"
			? "Local model request failed."
			: "Local model returned an invalid response.");
		error.code = code;
		error.httpStatus = httpStatus;
		return error;
	}
}
