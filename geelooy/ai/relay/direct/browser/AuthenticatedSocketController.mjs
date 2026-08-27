// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";
import { AuthenticatedTargetLifecycle } from "./AuthenticatedTargetLifecycle.mjs";
import { CdpClient } from "./CdpClient.mjs";
import { ChatGptTargetSelector } from "./ChatGptTargetSelector.mjs";
import { OwnedHostInspector } from "./OwnedHostInspector.mjs";
import { TargetNavigationVerifier } from "./TargetNavigationVerifier.mjs";

const require = createRequire(import.meta.url);
const { configuredAgentStartUrl } = require("../../split-browser/config.cjs");

/**
 * @file Binds one exact owned target and proves final custom-GPT navigation.
 * @description
 * The Awtsmoos never composes inside about:blank or another tab. Awtsmoos.com binds
 * the target id returned by Chrome, verifies the configured GPT route on that socket,
 * verifies authenticated composer readiness, then exposes one bounded send vessel.
 */
export class AuthenticatedSocketController {
	constructor(options = {}) {
		this.port = options.port || 9224;
		this.replaceChatGptTabs = options.replaceChatGptTabs === true;
		this.forceNewTarget = options.forceNewTarget === true;
		this.targetUrl = options.agentStartUrl || configuredAgentStartUrl();
		this.targetSelector = options.targetSelector || new ChatGptTargetSelector({
			port: this.port,
			agentStartUrl: this.targetUrl
		});
		this.clientFactory = options.clientFactory ||
			(target => new CdpClient(target.webSocketDebuggerUrl));
		this.inspectorFactory = options.inspectorFactory ||
			(client => new OwnedHostInspector(client));
		this.navigation = options.navigation || new TargetNavigationVerifier(options);
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
		const { target, owned } = acquisition;
		const cdpClient = this.clientFactory(target);
		try {
			await cdpClient.connect();
			await this.lifecycle.activate(target.id);
			const navigation = await this.navigation.ensure(cdpClient, this.targetUrl, timeoutMs);
			const inspector = this.inspectorFactory(cdpClient);
			const pageState = await this.lifecycle.waitUntilReady(inspector, timeoutMs);
			return this.host(acquisition, cdpClient, inspector, pageState, navigation);
		} catch (error) {
			error.tabClose = await this.lifecycle.close({ targetId: target.id, cdpClient, owned });
			throw error;
		}
	}

	host(acquisition, cdpClient, inspector, pageState, navigation) {
		const { target, owned, source } = acquisition;
		return {
			cdpClient,
			debugPort: this.port,
			inspector,
			pageState,
			navigation,
			targetSource: source,
			ownedTarget: owned,
			close: () => this.lifecycle.close({ targetId: target.id, cdpClient, owned })
		};
	}
}
