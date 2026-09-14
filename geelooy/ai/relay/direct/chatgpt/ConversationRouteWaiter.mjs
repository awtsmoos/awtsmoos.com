//B"H
//Boruch Hashem
//Blessed be He

import { createRequire } from "node:module";
import { ConversationPromptEvidence } from "./ConversationPromptEvidence.mjs";

const require = createRequire(import.meta.url);
const { configuredAgentStartUrl, requireConfiguredAgentStartUrl } = require("../../split-browser/config.cjs");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * @file Converts ChatGPT's custom-GPT route into a prompt-verified canonical account route.
 * @description
 * The Awtsmoos lets the same created thread pass from its Shliach doorway into the account's /c/ vessel;
 * Awtsmoos.com never clicks Send twice and verifies the visible prompt through native DOM testimony.
 */
export class ConversationRouteWaiter {
	constructor({
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		intervalMs = 250,
		now = () => Date.now(),
		evidenceFactory = client => new ConversationPromptEvidence(client)
	} = {}) {
		this.sleep = sleep;
		this.intervalMs = intervalMs;
		this.now = now;
		this.evidenceFactory = evidenceFactory;
	}

	async wait(controller, {
		agentStartUrl = configuredAgentStartUrl(),
		prompt = "",
		timeoutMs = 60000
	} = {}) {
		const start = new URL(requireConfiguredAgentStartUrl(agentStartUrl));
		const evidence = this.evidenceFactory(controller.cdpClient);
		const deadline = this.now() + timeoutMs;
		let canonicalizing = null;
		while (this.now() < deadline) {
			const page = await controller.inspector.inspect();
			const canonical = this.canonical(page.url, start.origin);
			if (canonical && await evidence.matches(prompt)) return canonical;
			const candidate = this.customGptCandidate(page.url, start);
			if (candidate && canonicalizing !== candidate.conversationId) {
				canonicalizing = candidate.conversationId;
				await this.navigateCanonical(controller, candidate);
			}
			await this.sleep(this.intervalMs);
		}
		const error = new Error("ChatGPT did not expose a prompt-verified canonical /c/<conversation-id> route.");
		error.code = "chatgpt_saved_conversation_route_missing";
		throw error;
	}

	canonical(url, expectedOrigin) {
		return routeFromUrl(url, expectedOrigin, /^\/c\/([^/]+)\/?$/);
	}

	customGptCandidate(url, start) {
		const escaped = escapeRegex(start.pathname.replace(/\/$/, ""));
		return routeFromUrl(url, start.origin, new RegExp(`^${escaped}\\/c\\/([^/]+)\\/?$`));
	}

	async navigateCanonical(controller, route) {
		const response = await controller.cdpClient.send("Page.navigate", {
			url: route.conversationUrl
		}, 10000);
		if (response?.errorText) {
			const error = new Error(`canonical_conversation_navigation_failed:${response.errorText}`);
			error.code = "chatgpt_canonical_conversation_navigation_failed";
			throw error;
		}
	}
}

function routeFromUrl(url, expectedOrigin, pattern) {
	try {
		const actual = new URL(url);
		if (actual.origin !== expectedOrigin) return null;
		const match = actual.pathname.match(pattern);
		if (!match) return null;
		const conversationId = decodeURIComponent(match[1]);
		if (!UUID.test(conversationId)) return null;
		return { conversationId, conversationUrl: `${actual.origin}/c/${conversationId}` };
	} catch {
		return null;
	}
}

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
