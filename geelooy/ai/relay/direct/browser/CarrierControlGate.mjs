//B"H
// Boruch Hashem
// Blessed is He

import { CarrierNodeFinder } from "./CarrierNodeFinder.mjs";

const COMPOSER_SELECTORS = [
	"div#prompt-textarea[contenteditable='true']",
	"textarea#mobile-composer-prompt",
	"textarea[aria-label='Chat with ChatGPT']",
	"[contenteditable='true'][role='textbox']"
];
const SEND_SELECTORS = [
	"button[data-testid='send-button']",
	"button[aria-label='Send prompt']",
	"button[aria-label='Send message']"
];

/**
 * Send readiness is read through native DOM nodes and attributes. The Awtsmoos
 * inspects neither prompt text nor page scripts: it requires a visible composer and
 * an enabled visible Send control, then returns only the matching Send selector.
 */
export class CarrierControlGate {
	constructor(cdpClient, {
		timeoutMs = 5000,
		intervalMs = 200,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		nodeFinder = new CarrierNodeFinder(cdpClient, { timeoutMs: intervalMs })
	} = {}) {
		this.cdpClient = cdpClient;
		this.timeoutMs = timeoutMs;
		this.intervalMs = intervalMs;
		this.sleep = sleep;
		this.nodeFinder = nodeFinder;
	}

	async waitUntilReady() {
		const deadline = Date.now() + this.timeoutMs;
		let state = null;
		while (Date.now() < deadline) {
			state = await this.inspect();
			if (state.ready) return state;
			await this.sleep(this.intervalMs);
		}
		throw new Error(`Website Send did not become ready: ${state?.reason || "unknown"}.`);
	}

	async inspect() {
		const composer = await this.nodeFinder.findOnce(COMPOSER_SELECTORS);
		if (!composer) return this.state(false, null, "composer_missing");
		const send = await this.nodeFinder.findOnce(SEND_SELECTORS);
		if (!send) return this.state(false, null, "send_unavailable");
		const attributes = await this.attributes(send.nodeId);
		const disabled = attributes.has("disabled")
			|| attributes.get("aria-disabled") === "true";
		return disabled
			? this.state(false, null, "send_disabled")
			: this.state(true, send.selector, "ready");
	}

	async attributes(nodeId) {
		const result = await this.cdpClient.send("DOM.getAttributes", { nodeId }, 5000);
		const values = result.attributes ?? [];
		const attributes = new Map();
		for (let index = 0; index < values.length; index += 2) {
			attributes.set(values[index], values[index + 1] ?? "");
		}
		return attributes;
	}

	state(ready, sendSelector, reason) {
		return { ready, sendSelector, reason };
	}
}

export { SEND_SELECTORS };
