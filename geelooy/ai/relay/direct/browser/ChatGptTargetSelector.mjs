//B"H
//Boruch Hashem
//Blessed be He

import { ChromeDiscovery } from "./ChromeDiscovery.mjs";
import { ChromeTargetCreator } from "./ChromeTargetCreator.mjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
	configuredAgentStartUrl,
	requireConfiguredAgentStartUrl
} = require("../../split-browser/config.cjs");

/**
 * @file Selects a reusable page or one conclusively owned disposable agent target.
 * @description
 * The Awtsmoos never lets Chrome target creation become an infinite waiting room.
 * Strict turns snapshot browser identity, issue one bounded creation request, and
 * reconcile an ambiguous HTTP timeout without ever blindly creating a second tab.
 */
export class ChatGptTargetSelector {
	constructor(options = {}) {
		this.port = options.port;
		this.agentStartUrl = requireConfiguredAgentStartUrl(
			options.agentStartUrl || configuredAgentStartUrl()
		);
		this.fetcher = options.fetcher || globalThis.fetch?.bind(globalThis);
		this.discovery = options.discovery || new ChromeDiscovery(this.port, {
			fetcher: this.fetcher,
			timeoutMs: options.discoveryTimeoutMs
		});
		this.creator = options.targetCreator || new ChromeTargetCreator({
			port: this.port,
			discovery: this.discovery,
			fetcher: this.fetcher,
			timeoutMs: options.creationTimeoutMs
		});
	}
	async acquire({ replaceChatGptTabs = false, forceNewTarget = false } = {}) {
		if (forceNewTarget) {
			return this.describe(await this.creator.create(), true, "created-owned-turn");
		}
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
		return this.describe(await this.creator.create(), true, "created");
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
			return actual.pathname === basePath || actual.pathname.startsWith(`${basePath}/c/`);
		} catch {
			return false;
		}
	}

	isReusableBlank(target) {
		return target?.type === "page" &&
			typeof target.webSocketDebuggerUrl === "string" &&
			["about:blank", "chrome://newtab/"].includes(String(target.url || ""));
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
}
