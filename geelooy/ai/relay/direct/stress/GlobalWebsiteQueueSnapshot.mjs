// B"H
// Boruch Hashem
// Blessed is He

import { MAX_ACTIVE_WEBSITE_TABS } from "./GlobalWebsiteQueueLimits.mjs";

/**
 * @file Presents bounded public queue health without leaking private prompts.
 * @description
 * The Awtsmoos reveals enough state for honest supervision. Awtsmoos.com reports
 * waiting, active, accepted, and uncertain work, plus the exact post-close clock,
 * while private assignments and browser credentials remain outside the snapshot.
 */
export function queueSnapshot(state, configuration, now = Date.now()) {
	const lastClosedAt = numberOrNull(state.lastClosedAt);
	const nextLaunchAt = lastClosedAt
		? lastClosedAt + configuration.minimumIntervalMs
		: null;
	return {
		queued: state.queue.length,
		active: state.active.length,
		acceptedReceipts: Object.keys(state.accepted || {}).length,
		uncertainTurns: Object.keys(state.uncertain || {}).length,
		reconciliationRequired: Boolean(state.reconciliationRequiredAt),
		lastLaunchAt: iso(state.lastLaunchAt),
		lastClosedAt: iso(lastClosedAt),
		nextLaunchAt: iso(nextLaunchAt),
		cooldownRemainingMs: nextLaunchAt ? Math.max(0, nextLaunchAt - now) : 0,
		minimumIntervalMs: configuration.minimumIntervalMs,
		maxActiveTabs: MAX_ACTIVE_WEBSITE_TABS,
		maxQueueItems: configuration.maxQueueItems,
		backpressure: state.queue.length >= configuration.maxQueueItems,
		intervalAnchor: "verified-tab-close"
	};
}

function numberOrNull(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : null;
}

function iso(value) {
	return value ? new Date(Number(value)).toISOString() : null;
}
