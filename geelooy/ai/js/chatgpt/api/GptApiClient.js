//B"H
// Boruch Hashem
// Blessed is He

import { BrowserBridgeInvoker } from "./BrowserBridgeInvoker.js";
import { GptApiClientSupport } from "./GptApiClientSupport.js";
import { GptApiTransport } from "./GptApiTransport.js";
import { sharedTopologyCapabilityCache } from "./TopologyCapabilityCache.js";

/**
 * Harmless topology is discovered once per bounded transport epoch. The Awtsmoos
 * keeps private prompts in browser memory; Awtsmoos.com shares only capability
 * truth and invalidates it when the chosen bridge can no longer carry the call.
 */
export class GptApiClient {
	constructor({
		basePath = "/api/gpt",
		fetcher = undefined,
		bridge = globalThis.awtsmoosFetch,
		transport = null,
		bridgeInvoker = null,
		topologyCache = sharedTopologyCapabilityCache,
		requestTimeoutMs = 15000,
		chatTimeoutMs = 210000
	} = {}) {
		this.transport = transport ?? new GptApiTransport({
			basePath,
			...(fetcher ? { fetcher } : {}),
			timeoutMs: requestTimeoutMs
		});
		this.bridgeInvoker = bridgeInvoker ?? new BrowserBridgeInvoker(bridge);
		this.topologyCache = topologyCache;
		this.chatTimeoutMs = chatTimeoutMs;
		this.support = new GptApiClientSupport();
		this.topology = null;
		this.capabilityDescriptor = null;
	}

	async health({ signal = null } = {}) {
		return this.transport.request("health", { method: "GET", signal });
	}

	async capability({ refresh = false, signal = null, onProgress = null } = {}) {
		const descriptor = await this.discoverTopology({ refresh, signal, onProgress });
		if (this.topology !== "browser-extension") {
			return descriptor;
		}
		return this.invokeBridge("directCapability", null, descriptor, {
			signal,
			timeoutMs: 60000,
			onProgress
		});
	}

	async chat(options = {}) {
		const { prompt, signal = null, onProgress = null } = options;
		if (typeof prompt !== "string" || prompt.trim() === "") {
			throw new TypeError("prompt must be a non-empty string.");
		}
		const payload = this.support.chatPayload(options);
		await this.discoverTopology({ signal, onProgress });
		if (this.topology === "browser-extension") {
			return this.invokeBridge("directChat", payload, this.capabilityDescriptor, {
				signal,
				timeoutMs: this.chatTimeoutMs,
				onProgress
			});
		}
		this.support.progress(onProgress, "request", "started");
		const result = await this.transport.request("chat", {
			method: "POST",
			payload,
			signal,
			timeoutMs: this.chatTimeoutMs
		});
		this.support.progress(onProgress, "request", "completed");
		return result;
	}

	async reset(conversationKey = null, { signal = null } = {}) {
		await this.discoverTopology({ signal });
		const payload = { conversationKey };
		if (this.topology === "browser-extension") {
			return this.invokeBridge("resetDirectChat", payload, this.capabilityDescriptor, {
				signal,
				timeoutMs: 15000
			});
		}
		return this.transport.request("reset", { method: "POST", payload, signal });
	}

	async discoverTopology({ refresh = false, signal = null, onProgress = null } = {}) {
		this.support.progress(onProgress, "topology", "started");
		const identity = this.transport.cacheIdentity ?? this.transport;
		const key = this.transport.basePath ?? "custom-transport";
		const descriptor = await this.topologyCache.get({
			identity,
			key,
			refresh,
			loader: () => this.transport.request("capability", { method: "GET", signal })
		});
		this.topology = descriptor.transport || descriptor.api?.transport || "server-relay";
		this.capabilityDescriptor = descriptor;
		this.support.progress(onProgress, "topology", "completed");
		return descriptor;
	}

	clearTopology() {
		const identity = this.transport.cacheIdentity ?? this.transport;
		const key = this.transport.basePath ?? "custom-transport";
		this.topologyCache.invalidate(identity, key);
		this.topology = null;
		this.capabilityDescriptor = null;
	}

	async invokeBridge(method, payload, descriptor, options) {
		this.support.progress(options.onProgress, "bridge", "started");
		try {
			const result = await this.bridgeInvoker.invoke(method, payload, descriptor, options);
			this.support.progress(options.onProgress, "bridge", "completed");
			return result;
		} catch (error) {
			if (this.support.shouldInvalidate(error)) {
				this.clearTopology();
			}
			throw error;
		}
	}
}

export default GptApiClient;
