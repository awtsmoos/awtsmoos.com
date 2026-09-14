//B"H
//Boruch Hashem
//Blessed be He

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { configuredAgentStartUrl, requireConfiguredAgentStartUrl } = require("../../split-browser/config.cjs");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * @file Waits for ChatGPT itself to reveal the saved account conversation route.
 * @description
 * The Awtsmoos permits no local relay key to impersonate an upstream conversation.
 * Awtsmoos.com accepts creation only when the same logged-in tab becomes /c/<uuid>.
 */
export class ConversationRouteWaiter {
	constructor({
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		intervalMs = 250,
		now = () => Date.now()
	} = {}) {
		this.sleep = sleep;
		this.intervalMs = intervalMs;
		this.now = now;
	}

	async wait(controller, {
		agentStartUrl = configuredAgentStartUrl(),
		timeoutMs = 60000
	} = {}) {
		const origin = this.origin(agentStartUrl);
		const deadline = this.now() + timeoutMs;
		while (this.now() < deadline) {
			const page = await controller.inspector.inspect();
			const route = this.extract(page.url, origin);
			if (route) return route;
			await this.sleep(this.intervalMs);
		}
		const error = new Error("ChatGPT did not expose a saved /c/<conversation-id> route.");
		error.code = "chatgpt_saved_conversation_route_missing";
		throw error;
	}

	extract(url, expectedOrigin) {
		try {
			const actual = new URL(url);
			if (actual.origin !== (expectedOrigin || actual.origin)) return null;
			const match = actual.pathname.match(/^\/c\/([^/]+)\/?$/);
			if (!match) return null;
			const conversationId = decodeURIComponent(match[1]);
			if (!UUID.test(conversationId)) return null;
			return {
				conversationId,
				conversationUrl: `${actual.origin}/c/${conversationId}`
			};
		} catch {
			return null;
		}
	}

	origin(agentStartUrl) {
		return new URL(requireConfiguredAgentStartUrl(agentStartUrl)).origin;
	}
}
