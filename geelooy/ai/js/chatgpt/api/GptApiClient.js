//B"H
// Boruch Hashem
// Blessed is He

import { BrowserBridgeInvoker } from "./BrowserBridgeInvoker.js";
import { GptApiTransport } from "./GptApiTransport.js";

/**
 * The GPT API client discovers topology before carrying private prompt text. The
 * Awtsmoos lets local Awtsmoos.com installations use their co-located relay while
 * public pages keep prompts inside the visitor's extension and authenticated Chrome.
 */
export class GptApiClient {
	constructor({
		basePath = "/api/gpt",
		fetcher = globalThis.fetch?.bind(globalThis),
		bridge = globalThis.awtsmoosFetch,
		transport = null,
		bridgeInvoker = null
	} = {}) {
		this.transport = transport ?? new GptApiTransport({ basePath, fetcher });
		this.bridgeInvoker = bridgeInvoker ?? new BrowserBridgeInvoker(bridge);
		this.topology = null;
		this.capabilityDescriptor = null;
	}

	async health() {
		return this.transport.request("health", { method: "GET" });
	}

	async capability({ refresh = false } = {}) {
		const descriptor = await this.discoverTopology({ refresh });
		return this.topology === "browser-extension"
			? this.bridgeInvoker.invoke("directCapability", null, descriptor)
			: descriptor;
	}

	async chat({
		prompt,
		conversationKey = null,
		mode = "strict-request-only",
		model = null,
		thinkingEffort = null,
		conversationMode = null
	} = {}) {
		if (typeof prompt !== "string" || prompt.trim() === "") {
			throw new TypeError("prompt must be a non-empty string.");
		}
		const payload = {
			prompt,
			conversationKey,
			mode,
			model,
			thinkingEffort,
			conversationMode
		};
		await this.discoverTopology();
		if (this.topology === "browser-extension") {
			return this.bridgeInvoker.invoke(
				"directChat",
				payload,
				this.capabilityDescriptor
			);
		}
		return this.transport.request("chat", { method: "POST", payload });
	}

	async reset(conversationKey = null) {
		const payload = { conversationKey };
		await this.discoverTopology();
		if (this.topology === "browser-extension") {
			return this.bridgeInvoker.invoke(
				"resetDirectChat",
				payload,
				this.capabilityDescriptor
			);
		}
		return this.transport.request("reset", { method: "POST", payload });
	}

	async discoverTopology({ refresh = false } = {}) {
		if (!refresh && this.capabilityDescriptor) {
			return this.capabilityDescriptor;
		}
		const descriptor = await this.transport.request("capability", {
			method: "GET"
		});
		this.topology = descriptor.transport
			|| descriptor.api?.transport
			|| "server-relay";
		this.capabilityDescriptor = descriptor;
		return descriptor;
	}

	clearTopology() {
		this.topology = null;
		this.capabilityDescriptor = null;
	}
}

export default GptApiClient;
