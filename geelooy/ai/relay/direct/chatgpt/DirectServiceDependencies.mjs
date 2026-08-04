// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";
import { AgentTabCatalog } from "../browser/AgentTabCatalog.mjs";
import { AgentTabProtector } from "../browser/AgentTabProtector.mjs";
import { AgentTabWatchdog } from "../browser/AgentTabWatchdog.mjs";
import { DebugPortResolver } from "../browser/DebugPortResolver.mjs";
import { GlobalWebsiteTurnQueue } from "../stress/GlobalWebsiteTurnQueue.mjs";
import { ImmediateTurnQueue } from "../stress/ImmediateTurnQueue.mjs";
import { POST_CLOSE_COOLDOWN_MS } from "../stress/GlobalWebsiteQueuePolicy.mjs";
import { ConversationModePolicy } from "./ConversationModePolicy.mjs";
import { ConversationStore } from "./ConversationStore.mjs";
import { DirectClient } from "./DirectClient.mjs";
import { DirectServiceReporter } from "./DirectServiceReporter.mjs";
import { DirectServiceTurnCoordinator } from "./DirectServiceTurnCoordinator.mjs";
import { FallbackConversationService } from "./FallbackConversationService.mjs";
import { RequestOnlyCapabilityService } from "./RequestOnlyCapabilityService.mjs";
import { WebsiteCapabilityPresenter } from "./WebsiteCapabilityPresenter.mjs";
import { WebsiteLoginCoordinator } from "./WebsiteLoginCoordinator.mjs";

const require = createRequire(import.meta.url);
const { openDebugChrome } = require("../../split-browser/cdpChrome.cjs");

/**
 * @file Builds the submit-only service around the authenticated profile's owner port.
 * @description
 * The Awtsmoos defaults to canonical port 9223 and accepts the actual port returned
 * by Chrome's singleton-aware starter. One final-URL target sends and closes while
 * the agent continues beyond the browser through durable filesystem and tunnel work.
 */
export function buildDirectServiceDependencies(options = {}) {
	const preferredPort = Number(options.preferredPort ??
		process.env.AWTSMOOS_CHROME_DEBUG_PORT ?? 9223) || 9223;
	const interval = Math.max(POST_CLOSE_COOLDOWN_MS, Number(
		options.minimumIntervalMs ??
		process.env.AWTSMOOS_WEBSITE_AGENT_LAUNCH_INTERVAL_MS ??
		POST_CLOSE_COOLDOWN_MS
	));
	const fixtureBoundary = Boolean(options.websiteService || options.clientFactory);
	const protectPhysicalTabs = options.protectPhysicalTabs ?? !fixtureBoundary;
	const store = options.store ?? new ConversationStore();
	const browserStarter = options.browserStarter ?? (async port => {
		const result = await openDebugChrome({ debugPort: port });
		if (!result.ok) throw codedError(result.status || "debug_chrome_start_failed");
		return result;
	});
	const portResolver = options.portResolver ?? new DebugPortResolver({
		preferredPort,
		candidates: [preferredPort, 9223, 9224],
		browserStarter
	});
	const loginCoordinator = options.loginCoordinator ?? new WebsiteLoginCoordinator();
	const reporter = options.reporter ?? new DirectServiceReporter();
	const capabilityPresenter = options.capabilityPresenter ?? new WebsiteCapabilityPresenter();
	const conversationModePolicy = options.conversationModePolicy ?? new ConversationModePolicy();
	const clientFactory = options.clientFactory ?? (port => new DirectClient({
		port,
		forceNewTarget: true
	}));
	const websiteService = options.websiteService ?? new FallbackConversationService({
		store,
		portResolver,
		clientFactory
	});
	const capabilityService = options.capabilityService ?? new RequestOnlyCapabilityService({
		preferredPort,
		portResolver
	});
	const turnQueue = options.turnQueue ?? (fixtureBoundary && options.enforceGlobalQueue !== true
		? new ImmediateTurnQueue()
		: new GlobalWebsiteTurnQueue({ minimumIntervalMs: interval, maxActiveTabs: 1 }));
	const tabCatalog = options.tabCatalog ?? (protectPhysicalTabs
		? new AgentTabCatalog({ portResolver })
		: null);
	const tabProtector = options.tabProtector ?? (tabCatalog
		? new AgentTabProtector({ catalog: tabCatalog })
		: null);
	const tabWatchdog = options.tabWatchdog ?? (tabProtector
		? new AgentTabWatchdog({ protector: tabProtector, intervalMs: 500 })
		: null);
	const turnCoordinator = options.turnCoordinator ?? new DirectServiceTurnCoordinator({
		queue: turnQueue,
		protector: tabProtector
	});
	return {
		preferredPort, store, portResolver, loginCoordinator, reporter,
		capabilityPresenter, conversationModePolicy, websiteService, capabilityService,
		turnQueue, turnCoordinator, tabCatalog, tabProtector, tabWatchdog
	};
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
