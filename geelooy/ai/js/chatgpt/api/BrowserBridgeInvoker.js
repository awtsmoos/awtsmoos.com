//B"H
// Boruch Hashem
// Blessed is He

import { gptApiError } from "./GptApiTransport.js";
import { RequestAbortScope } from "./RequestAbortScope.js";

/**
 * The visitor extension is the private vessel after harmless topology discovery.
 * The Awtsmoos bounds its named invocation; Awtsmoos.com returns quickly when the
 * bridge is absent instead of waiting through an invisible handshake.
 */
export class BrowserBridgeInvoker {
	constructor(bridge = globalThis.awtsmoosFetch) {
		this.bridge = bridge;
	}

	async invoke(method, payload, serverDescriptor, {
		signal = null,
		timeoutMs = 210000
	} = {}) {
		const callable = this.bridge?.[method];
		if (typeof callable !== "function") {
			throw gptApiError(
				"GPT_BROWSER_BRIDGE_UNAVAILABLE",
				`The Awtsmoos browser bridge does not expose ${method}.`
			);
		}
		const scope = new RequestAbortScope({ signal, timeoutMs });
		try {
			const invocation = Promise.resolve().then(() => payload == null
				? callable.call(this.bridge)
				: callable.call(this.bridge, payload));
			const result = await scope.race(invocation);
			return {
				...result,
				apiTransport: "browser-extension",
				serverRelayAttempted: serverDescriptor?.serverRelayAttempted === true
			};
		} catch (error) {
			if (scope.code === "GPT_API_TIMEOUT") {
				throw gptApiError("GPT_BROWSER_BRIDGE_TIMEOUT", "Browser relay request timed out.");
			}
			if (scope.code === "GPT_API_ABORTED") {
				throw gptApiError("GPT_BROWSER_BRIDGE_ABORTED", "Browser relay request was cancelled.");
			}
			throw error;
		} finally {
			scope.close();
		}
	}
}
