// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";
import { ChromeDiscovery } from "./ChromeDiscovery.mjs";

const require = createRequire(import.meta.url);
const { configuredAgentStartUrl, requireConfiguredAgentStartUrl } =
	require("../../split-browser/config.cjs");

/**
 * @file Creates every owned turn directly at the configured custom-GPT route.
 * @description
 * The Awtsmoos appoints no about:blank waypoint for production sends. Awtsmoos.com
 * asks Chrome to create the exact final URL, binds the returned target id and socket,
 * and closes that same target after the website confirms prompt acceptance.
 */
export class ChatGptTargetSelector {
	constructor(options = {}) {
		this.port = options.port;
		this.agentStartUrl = requireConfiguredAgentStartUrl(
			options.agentStartUrl || configuredAgentStartUrl()
		);
		this.discovery = options.discovery || new ChromeDiscovery(this.port);
		this.fetcher = options.fetcher || globalThis.fetch?.bind(globalThis);
	}

	async acquire({ replaceChatGptTabs = false, forceNewTarget = false } = {}) {
		if (forceNewTarget) {
			return this.describe(await this.createTarget(), true, "created-owned-final-url");
		}
		let targets = await this.discovery.listTargets();
		if (replaceChatGptTabs) {
			await this.closeChatGptTargets(targets);
			targets = await this.discovery.listTargets();
		}
		const chatGpt = targets.find(target => this.isMissionPage(target))
			?? targets.find(target => this.isChatGptPage(target));
		if (chatGpt) return this.describe(chatGpt, false, "existing-chatgpt");
		return this.describe(await this.createTarget(), true, "created-final-url");
	}

	isChatGptPage(target) {
		if (target?.type !== "page" || typeof target.webSocketDebuggerUrl !== "string") return false;
		try { return new URL(target.url).hostname === "chatgpt.com"; }
		catch { return false; }
	}

	isMissionPage(target) {
		if (!this.isChatGptPage(target)) return false;
		try {
			const actual = new URL(target.url);
			const mission = new URL(this.agentStartUrl);
			const base = mission.pathname.replace(/\/+$/, "");
			return actual.origin === mission.origin &&
				(actual.pathname === base || actual.pathname.startsWith(`${base}/`));
		} catch {
			return false;
		}
	}

	describe(target, owned, source) {
		return { target, owned, source };
	}

	async closeChatGptTargets(targets) {
		const chatTargets = targets.filter(target => this.isChatGptPage(target));
		await Promise.all(chatTargets.map(target => this.fetcher(
			`http://127.0.0.1:${this.port}/json/close/${encodeURIComponent(target.id)}`
		).catch(() => null)));
	}

	async createTarget() {
		const endpoint = `http://127.0.0.1:${this.port}/json/new?${encodeURIComponent(this.agentStartUrl)}`;
		const response = await this.fetcher(endpoint, { method: "PUT" });
		if (!response.ok) {
			const error = new Error(`Could not create owned custom-GPT target: ${response.status}.`);
			error.code = "custom_gpt_target_create_failed";
			throw error;
		}
		return response.json();
	}
}
