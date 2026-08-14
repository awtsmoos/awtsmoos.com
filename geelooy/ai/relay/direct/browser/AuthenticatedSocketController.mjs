//B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";
import { CdpClient } from "./CdpClient.mjs";
import { ChatGptTargetSelector } from "./ChatGptTargetSelector.mjs";
import { AuthenticatedTargetLifecycle } from "./AuthenticatedTargetLifecycle.mjs";
import { OwnedHostInspector } from "./OwnedHostInspector.mjs";

const require = createRequire(import.meta.url);
const { configuredAgentStartUrl } = require("../../split-browser/config.cjs");

/**
 * @file Opens one authenticated ChatGPT target and remembers exact ownership.
 * @description
 * The Awtsmoos never confuses one tab with another. Website agents force a fresh
 * owned target that is conclusively closed after their print; interactive callers
 * may still detach from a human-owned page without closing it.
 */
export class AuthenticatedSocketController {
	constructor(options = {}) {
		this.port = options.port || 9226;
		this.replaceChatGptTabs = options.replaceChatGptTabs === true;
		this.forceNewTarget = options.forceNewTarget === true;
		this.targetSelector = options.targetSelector || new ChatGptTargetSelector({
			port: this.port
		});
		this.clientFactory = options.clientFactory ||
			(target => new CdpClient(target.webSocketDebuggerUrl));
		this.inspectorFactory = options.inspectorFactory ||
			(client => new OwnedHostInspector(client));
		this.lifecycle = options.lifecycle || new AuthenticatedTargetLifecycle({
			port: this.port,
			fetcher: options.fetcher,
			sleep: options.sleep,
			inspectionIntervalMs: options.inspectionIntervalMs
		});
	}

	async open(timeoutMs = 45000) {
		const acquisition = await this.targetSelector.acquire({
			replaceChatGptTabs: this.replaceChatGptTabs,
			forceNewTarget: this.forceNewTarget
		});
		const { target, owned, source } = acquisition;
		const cdpClient = this.clientFactory(target);
		try {
			await cdpClient.connect();
			await this.lifecycle.activate(target.id);
			if (source !== "existing-chatgpt") {
				await cdpClient.send("Page.navigate", {
					url: configuredAgentStartUrl()
				}, 30000);
			}
			const inspector = this.inspectorFactory(cdpClient);
			const pageState = await this.lifecycle.waitUntilReady(inspector, timeoutMs);
			return this.host(acquisition, cdpClient, inspector, pageState);
		} catch (error) {
			error.tabClose = await this.lifecycle.close({
				targetId: target.id, cdpClient, owned
			});
			throw error;
		}
	}

	host(acquisition, cdpClient, inspector, pageState) {
		const { target, owned, source } = acquisition;
		return {
			cdpClient,
			debugPort: this.port,
			inspector,
			pageState,
			targetSource: source,
			ownedTarget: owned,
			close: () => this.lifecycle.close({
				targetId: target.id, cdpClient, owned
			})
		};
	}
}
