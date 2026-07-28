//B"H
// Boruch Hashem
// Blessed is He

(function installDirectRelayClient(globalObject) {
	const DEFAULT_BASE_URL = "http://127.0.0.1:38488";

	/**
	 * One bounded localhost messenger serves Awtsmoos.com. The Awtsmoos lets
	 * harmless capability truth rest briefly, while chat prompts are never cached,
	 * persisted, duplicated, or carried through public Awtsmoos.com servers.
	 */
	class DirectRelayClient {
		constructor(options = {}) {
			this.fetcher = options.fetcher || globalObject.fetch.bind(globalObject);
			this.baseUrl = options.baseUrl || DEFAULT_BASE_URL;
			this.clock = options.clock || (() => Date.now());
			this.capabilityLifetimeMs = options.capabilityLifetimeMs ?? 5000;
			this.capabilityEntry = null;
			this.capabilityPromise = null;
		}

		async capability({ refresh = false, signal } = {}) {
			const now = this.clock();
			if (!refresh && this.capabilityEntry?.expiresAt > now) {
				return { ...this.capabilityEntry.value, extensionCacheSource: "cache" };
			}
			if (!refresh && this.capabilityPromise) {
				return this.capabilityPromise;
			}
			this.capabilityPromise = this.request("/direct-capability", {
				method: "GET",
				timeoutMs: 5000,
				signal
			}).then(value => {
				this.capabilityEntry = { value, expiresAt: this.clock() + this.capabilityLifetimeMs };
				return { ...value, extensionCacheSource: "fresh" };
			}).catch(error => {
				this.capabilityEntry = null;
				throw error;
			}).finally(() => {
				this.capabilityPromise = null;
			});
			return this.capabilityPromise;
		}

		chat(rawPayload, { signal } = {}) {
			const payload = globalObject.AwtsmoosDirectRelayPayload
				.normalizeDirectChatPayload(rawPayload);
			return this.request("/direct-chat", {
				method: "POST",
				payload,
				timeoutMs: 240000,
				signal
			});
		}

		reset(conversationKey, { signal } = {}) {
			return this.request("/direct-reset", {
				method: "POST",
				payload: conversationKey ? { conversationKey } : {},
				timeoutMs: 5000,
				signal
			});
		}

		health({ signal } = {}) {
			return this.request("/direct-health", { method: "GET", timeoutMs: 3000, signal });
		}

		async request(path, { method, payload, timeoutMs, signal } = {}) {
			const controller = new AbortController();
			const startedAt = this.clock();
			const abortFromCaller = () => controller.abort(signal?.reason);
			if (signal?.aborted) {
				abortFromCaller();
			} else {
				signal?.addEventListener?.("abort", abortFromCaller, { once: true });
			}
			const timeout = setTimeout(() => controller.abort("relay_timeout"), timeoutMs);
			try {
				const options = { method, signal: controller.signal, cache: "no-store" };
				if (payload !== undefined) {
					options.headers = { "Content-Type": "application/json" };
					options.body = JSON.stringify(payload);
				}
				const response = await this.fetcher(`${this.baseUrl}${path}`, options);
				const result = await response.json().catch(() => ({}));
				if (!response.ok) {
					throw relayError(result.error || "direct_request_failed", result.safeHint);
				}
				return { ...result, extensionRelayMs: Math.max(0, this.clock() - startedAt) };
			} catch (error) {
				if (controller.signal.aborted && !signal?.aborted) {
					throw relayError("direct_relay_timeout", "The local relay did not answer in time.");
				}
				if (error?.awtsmoosSafeRelay) {
					throw error;
				}
				throw relayError("direct_relay_unavailable", "Start or refresh the local Awtsmoos relay.");
			} finally {
				clearTimeout(timeout);
				signal?.removeEventListener?.("abort", abortFromCaller);
			}
		}
	}

	function relayError(code, safeHint) {
		const error = new Error(safeHint || code);
		error.code = code;
		error.safeHint = safeHint || "The direct relay request failed.";
		error.awtsmoosSafeRelay = true;
		return error;
	}

	globalObject.AwtsmoosDirectRelayClientClass = DirectRelayClient;
	globalObject.AwtsmoosDirectRelayClient = new DirectRelayClient();
})(globalThis);
