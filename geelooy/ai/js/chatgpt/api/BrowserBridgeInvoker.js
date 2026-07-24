//B"H
// Boruch Hashem
// Blessed is He

import { gptApiError } from "./GptApiTransport.js";

/**
 * The visitor's extension is a local Awtsmoos.com vessel. The Awtsmoos invokes
 * only named bridge methods and adds transport testimony without exposing server
 * internals, credentials, or upstream identifiers to the public API response.
 */
export class BrowserBridgeInvoker {
	constructor(bridge = globalThis.awtsmoosFetch) {
		this.bridge = bridge;
	}

	async invoke(method, payload, serverDescriptor) {
		const callable = this.bridge?.[method];
		if (typeof callable !== "function") {
			throw gptApiError(
				"GPT_BROWSER_BRIDGE_UNAVAILABLE",
				`The Awtsmoos browser bridge does not expose ${method}.`
			);
		}
		const result = payload == null
			? await callable.call(this.bridge)
			: await callable.call(this.bridge, payload);
		return {
			...result,
			apiTransport: "browser-extension",
			serverRelayAttempted: serverDescriptor?.serverRelayAttempted === true
		};
	}
}
