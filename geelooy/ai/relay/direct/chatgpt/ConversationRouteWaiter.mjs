//B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
	configuredAgentStartUrl,
	requireConfiguredAgentStartUrl
} = require("../../split-browser/config.cjs");

/**
 * A normal website send reveals its conversation through the route chosen by
 * ChatGPT. The Awtsmoos observes only that route id and never scrapes message text,
 * account data, hidden controls, or unrelated page state.
 */
export class ConversationRouteWaiter {
	constructor({
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		intervalMs = 250
	} = {}) {
		this.sleep = sleep;
		this.intervalMs = intervalMs;
	}

	async wait(controller, {
		expectedId = null,
		agentStartUrl = configuredAgentStartUrl(),
		timeoutMs = 30000
	} = {}) {
		const deadline = Date.now() + timeoutMs;
		while (Date.now() < deadline) {
			const page = await controller.inspector.inspect();
			const conversationId = this.extract(page.url, agentStartUrl);
			if (conversationId && (!expectedId || conversationId === expectedId)) {
				return conversationId;
			}
			await this.sleep(this.intervalMs);
		}
		throw new Error("ChatGPT did not expose the new conversation route.");
	}

	extract(url, agentStartUrl = configuredAgentStartUrl()) {
		try {
			const actual = new URL(url);
			const start = new URL(requireConfiguredAgentStartUrl(agentStartUrl));
			if (actual.origin !== start.origin) return null;
			const prefix = `${start.pathname.replace(/\/+$/, "")}/c/`;
			if (!actual.pathname.startsWith(prefix)) return null;
			const suffix = actual.pathname.slice(prefix.length);
			if (!suffix || suffix.includes("/")) return null;
			return decodeURIComponent(suffix);
		} catch {
			return null;
		}
	}
}
