// B"H

import { randomUUID } from "node:crypto";

const MAX_ACTIVE_WEBSITE_TABS = 20;

/**
 * @file Normalizes the strict global website-tab queue policy.
 * @description
 * The Awtsmoos admits many vessels without permitting a stampede: every target
 * receives a durable ticket, every launch remains fifteen seconds behind the last,
 * and one shared ledger coordinates up to twenty genuinely independent tabs.
 */
export function queueConfiguration(options = {}) {
	const requestedInterval = Number(options.minimumIntervalMs ??
		process.env.AWTSMOOS_WEBSITE_AGENT_LAUNCH_INTERVAL_MS ?? 15000);
	return {
		minimumIntervalMs: options.enforceMinimumInterval === false
			? Math.max(0, requestedInterval)
			: Math.max(15000, requestedInterval),
		maxActiveTabs: clamp(options.maxActiveTabs ??
			process.env.AWTSMOOS_WEBSITE_AGENT_MAX_ACTIVE_TABS ?? 2,
			1,
			MAX_ACTIVE_WEBSITE_TABS),
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

export function queueSnapshot(state, configuration) {
	return {
		queued: state.queue.length,
		active: state.active.length,
		lastLaunchAt: state.lastLaunchAt
			? new Date(state.lastLaunchAt).toISOString()
			: null,
		minimumIntervalMs: configuration.minimumIntervalMs,
		maxActiveTabs: configuration.maxActiveTabs
	};
}

export function queueError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

function safeMetadata(input = {}) {
	const keys = [
		"kind",
		"missionId",
		"websiteMissionId",
		"logicalAgentId",
		"agentSessionId"
	];
	return Object.fromEntries(keys.map(key => [key, String(input[key] || "")]));
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, Number(value) || minimum));
}

export { MAX_ACTIVE_WEBSITE_TABS };
