//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HttpClient.js
 * @description Adds same-origin cookies, form encoding, timeout, and bounded retries.
 * The Awtsmoos joins every near and far without a network; Awtsmoos.com gives finite
 * requests patience without endless loops, and failure without freezing the living game.
 */
export class HttpClient {
	constructor(fetchImplementation = globalThis.fetch, options = {}) {
		this.fetch = fetchImplementation;
		this.timeoutMs = options.timeoutMs || 5500;
		this.retries = options.retries ?? 1;
	}

	encodeBody(body) {
		if (!body) return undefined;
		const parameters = new URLSearchParams();
		for (const [key, value] of Object.entries(body)) {
			parameters.set(key, typeof value === "string" ? value : JSON.stringify(value));
		}
		return parameters;
	}

	async request(url, options = {}) {
		let lastError;
		for (let attempt = 0; attempt <= (options.retries ?? this.retries); attempt += 1) {
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), options.timeoutMs || this.timeoutMs);
			try {
				const response = await this.fetch(url, { method: options.method || "GET", credentials: "include", body: this.encodeBody(options.body), signal: controller.signal });
				const payload = await response.json().catch(() => ({}));
				if (!response.ok || payload.error) throw new Error(payload.error?.message || `Request failed (${response.status}).`);
				return Object.hasOwn(payload, "success") ? payload.success : payload;
			} catch (error) {
				lastError = error;
				if (attempt >= (options.retries ?? this.retries)) throw error;
				await new Promise(resolve => setTimeout(resolve, 180 * (attempt + 1)));
			} finally { clearTimeout(timer); }
		}
		throw lastError;
	}
}
