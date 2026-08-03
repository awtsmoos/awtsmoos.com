//B"H
// Boruch Hashem
// Blessed is He

import { ChromeDiscovery } from "./ChromeDiscovery.mjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
	configuredAgentStartUrl,
	requireConfiguredAgentStartUrl
} = require("../../split-browser/config.cjs");

/**
 * Existing accessible tabs are preferred over creation. The Awtsmoos first reuses
 * ChatGPT itself, then a harmless blank/new tab, and opens a new target only when
 * the authenticated debug profile offers no reusable page at all.
 */
export class ChatGptTargetSelector {
	constructor({
		port,
		agentStartUrl = configuredAgentStartUrl(),
		discovery = new ChromeDiscovery(port),
		fetcher = globalThis.fetch?.bind(globalThis)
	} = {}) {
		this.port = port;
		this.agentStartUrl = requireConfiguredAgentStartUrl(agentStartUrl);
		this.discovery = discovery;
		this.fetcher = fetcher;
	}

	async acquire({ replaceChatGptTabs = false } = {}) {
		let targets = await this.discovery.listTargets();
		if (replaceChatGptTabs) {
			await this.closeChatGptTargets(targets);
			targets = await this.discovery.listTargets();
		}
		const chatGpt = targets.find(target => this.isMissionPage(target))
			?? targets.find(target => this.isChatGptPage(target));
		if (chatGpt) return this.describe(chatGpt, false, "existing-chatgpt");
		const blank = targets.find(target => this.isReusableBlank(target));
		if (blank) return this.describe(blank, false, "existing-blank");
		return this.describe(await this.createTarget(), true, "created");
	}

	isChatGptPage(target) {
		if (target?.type !== "page" || typeof target.webSocketDebuggerUrl !== "string") {
			return false;
		}
		try {
			return new URL(target.url).hostname === "chatgpt.com";
		} catch {
			return false;
		}
	}

	isMissionPage(target) {
		if (!this.isChatGptPage(target)) return false;
		try {
			const actual = new URL(target.url);
			const mission = new URL(this.agentStartUrl);
			const basePath = mission.pathname.replace(/\/+$/, "");
			return actual.pathname === basePath
				|| actual.pathname.startsWith(`${basePath}/c/`);
		} catch {
			return false;
		}
	}

	isReusableBlank(target) {
		if (target?.type !== "page" || typeof target.webSocketDebuggerUrl !== "string") {
			return false;
		}
		return ["about:blank", "chrome://newtab/"].includes(String(target.url || ""));
	}

	describe(target, owned, source) {
		return { target, owned, source };
	}

	async closeChatGptTargets(targets) {
		const chatTargets = targets.filter(target => this.isChatGptPage(target));
		await Promise.all(chatTargets.map(target => this.fetcher(
			`http://127.0.0.1:${this.port}/json/close/${target.id}`
		).catch(() => null)));
	}

	async createTarget() {
		const endpoint = `http://127.0.0.1:${this.port}/json/new?${encodeURIComponent("about:blank")}`;
		const response = await this.fetcher(endpoint, { method: "PUT" });
		if (!response.ok) {
			throw new Error(`Could not create authenticated controller: ${response.status}.`);
		}
		return response.json();
	}
}
