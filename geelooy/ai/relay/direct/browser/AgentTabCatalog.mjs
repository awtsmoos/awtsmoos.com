// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { configuredAgentStartUrl } = require("../../split-browser/config.cjs");

/**
 * @file Reads only the authenticated Awtsmoos Shliach targets from Chrome.
 * @description
 * The Awtsmoos distinguishes the user's other pages from the temporary vessels
 * created for website agents. Awtsmoos.com counts only the configured custom GPT,
 * preserving unrelated browsers, profiles, tools, games, and human work.
 */
export class AgentTabCatalog {
	constructor(options = {}) {
		if (!options.portResolver) throw new TypeError("portResolver is required.");
		this.portResolver = options.portResolver;
		this.fetcher = options.fetcher || globalThis.fetch?.bind(globalThis);
		this.agentStartUrl = options.agentStartUrl || configuredAgentStartUrl();
	}

	async snapshot({ refresh = false } = {}) {
		const port = await this.portResolver.resolve({ refresh });
		const response = await this.fetcher(`http://127.0.0.1:${port}/json/list`);
		if (!response.ok) throw new Error(`agent_tab_catalog_failed_${response.status}`);
		const targets = await response.json();
		const agentTabs = targets.filter(target => this.isAgentPage(target));
		const rootTabs = agentTabs.filter(target => !this.isConversation(target));
		const conversationTabs = agentTabs.filter(target => this.isConversation(target));
		return {
			port,
			total: agentTabs.length,
			rootTabs,
			conversationTabs,
			agentTabs
		};
	}

	isAgentPage(target) {
		if (target?.type !== "page") return false;
		try {
			const actual = new URL(String(target.url || ""));
			const configured = new URL(this.agentStartUrl);
			const basePath = configured.pathname.replace(/\/+$/, "");
			return actual.origin === configured.origin &&
				(actual.pathname === basePath || actual.pathname.startsWith(`${basePath}/`));
		} catch {
			return false;
		}
	}

	isConversation(target) {
		try {
			return /\/c\//.test(new URL(String(target.url || "")).pathname);
		} catch {
			return false;
		}
	}
}
