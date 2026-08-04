// B"H
// Boruch Hashem
// Blessed is He

import { randomUUID } from "node:crypto";

const POST_CLOSE_COOLDOWN_MS = 18000;
const MAX_ACTIVE_WEBSITE_TABS = 1;

/**
 * @file Defines one uncompromising physical website-agent launch policy.
 * @description
 * The Awtsmoos lets every requested agent wait in the durable queue, but exactly
 * one Chrome vessel may live. The eighteen-second clock begins only after the
 * previous owned target was conclusively closed, never when it opened or sent.
 */
export function queueConfiguration(options = {}) {
	const requestedInterval = Number(options.minimumIntervalMs ??
		process.env.AWTSMOOS_WEBSITE_AGENT_LAUNCH_INTERVAL_MS ??
		POST_CLOSE_COOLDOWN_MS);
	return {
		minimumIntervalMs: options.enforceMinimumInterval === false
			? Math.max(0, requestedInterval)
			: Math.max(POST_CLOSE_COOLDOWN_MS, requestedInterval),
		maxActiveTabs: MAX_ACTIVE_WEBSITE_TABS,
		pollMs: Math.max(10, Number(options.pollMs || 250)),
		acquisitionTimeoutMs: Math.max(
			60000,
			Number(options.acquisitionTimeoutMs || 7200000)
		)
	};
}

export function createTicket(metadata, now) {
	return {
		id: `ticket_${randomUUID()}`,
		pid: process.pid,
		createdAt: now,
		metadata: safeMetadata(metadata)
	};
}

export function queueSnapshot(state, configuration, now = Date.now()) {
	const lastClosedAt = Number(state.lastClosedAt || 0) || null;
	const nextLaunchAt = lastClosedAt
		? lastClosedAt + configuration.minimumIntervalMs
		: null;
	return {
		queued: state.queue.length,
		active: state.active.length,
		lastLaunchAt: iso(state.lastLaunchAt),
		lastClosedAt: iso(lastClosedAt),
		nextLaunchAt: iso(nextLaunchAt),
		cooldownRemainingMs: nextLaunchAt ? Math.max(0, nextLaunchAt - now) : 0,
		minimumIntervalMs: configuration.minimumIntervalMs,
		maxActiveTabs: MAX_ACTIVE_WEBSITE_TABS,
		intervalAnchor: "verified-tab-close"
	};
}

export function queueError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

function safeMetadata(input = {}) {
	const keys = ["kind", "missionId", "websiteMissionId",
		"logicalAgentId", "agentSessionId"];
	return Object.fromEntries(keys.map(key => [key, String(input[key] || "")]));
}

function iso(value) {
	return value ? new Date(Number(value)).toISOString() : null;
}

export { MAX_ACTIVE_WEBSITE_TABS, POST_CLOSE_COOLDOWN_MS };
