// B"H
// Boruch Hashem
// Blessed is He

import { AgentTabCatalog } from "../browser/AgentTabCatalog.mjs";
import { AgentTabProtector } from "../browser/AgentTabProtector.mjs";
import { AgentTabWatchdog } from "../browser/AgentTabWatchdog.mjs";
import { DebugPortResolver } from "../browser/DebugPortResolver.mjs";
import { GlobalWebsiteTurnQueue } from "../stress/GlobalWebsiteTurnQueue.mjs";
import { ImmediateTurnQueue } from "../stress/ImmediateTurnQueue.mjs";
import { RequestPacer } from "../stress/RequestPacer.mjs";
import { ConversationModePolicy } from "./ConversationModePolicy.mjs";
import { ConversationStore } from "./ConversationStore.mjs";
import { DirectClient } from "./DirectClient.mjs";
import { DirectServiceReporter } from "./DirectServiceReporter.mjs";
import { DirectServiceTurnCoordinator } from "./DirectServiceTurnCoordinator.mjs";
import { FallbackConversationService } from "./FallbackConversationService.mjs";
import { RequestOnlyCapabilityService } from "./RequestOnlyCapabilityService.mjs";
import { WebsiteCapabilityPresenter } from "./WebsiteCapabilityPresenter.mjs";
import { WebsiteLoginCoordinator } from "./WebsiteLoginCoordinator.mjs";

/**
 * Builds the direct website vessel. Production receives both durable logical
 * admission and physical Chrome reconciliation; explicit fixtures remain isolated.
 */
export function buildDirectServiceDependencies(options = {}) {
	const preferredPort = options.preferredPort ??
		(Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 0) || null);
	const interval = Math.max(15000, Number(options.minimumIntervalMs ??
		process.env.AWTSMOOS_WEBSITE_AGENT_LAUNCH_INTERVAL_MS ?? 15000));
	const fixtureBoundary = Boolean(options.websiteService || options.clientFactory);
	const protectPhysicalTabs = options.protectPhysicalTabs ?? !fixtureBoundary;
	const store = options.store ?? new ConversationStore();
	const pacer = options.pacer ?? new RequestPacer({ minimumIntervalMs: interval });
	const portResolver = options.portResolver ?? new DebugPortResolver({ preferredPort });
	const loginCoordinator = options.loginCoordinator ?? new WebsiteLoginCoordinator();
	const reporter = options.reporter ?? new DirectServiceReporter();
	const capabilityPresenter = options.capabilityPresenter ?? new WebsiteCapabilityPresenter();
	const conversationModePolicy = options.conversationModePolicy ?? new ConversationModePolicy();
	const clientFactory = options.clientFactory ?? (port => new DirectClient({
		port, forceNewTarget: true, minimumIntervalHook: () => pacer.enter()
	}));
	const websiteService = options.websiteService ?? new FallbackConversationService({
		store, portResolver, clientFactory
	});
	const capabilityService = options.capabilityService ?? new RequestOnlyCapabilityService({
		preferredPort, portResolver
	});
	const turnQueue = options.turnQueue ?? (fixtureBoundary && options.enforceGlobalQueue !== true
		? new ImmediateTurnQueue()
		: new GlobalWebsiteTurnQueue({ minimumIntervalMs: interval }));
	const tabCatalog = options.tabCatalog ?? (protectPhysicalTabs
		? new AgentTabCatalog({ portResolver })
		: null);
	const tabProtector = options.tabProtector ?? (tabCatalog
		? new AgentTabProtector({ catalog: tabCatalog, maxTabs: turnQueue.maxActiveTabs })
		: null);
	const tabWatchdog = options.tabWatchdog ?? (tabProtector
		? new AgentTabWatchdog({ protector: tabProtector })
		: null);
	const turnCoordinator = options.turnCoordinator ?? new DirectServiceTurnCoordinator({
		queue: turnQueue, protector: tabProtector, schedule: options.scheduleDeliveryRelease || setImmediate
	});
	return {
		preferredPort, store, pacer, portResolver, loginCoordinator, reporter,
		capabilityPresenter, conversationModePolicy, websiteService, capabilityService,
		turnQueue, turnCoordinator, tabCatalog, tabProtector, tabWatchdog
	};
}
