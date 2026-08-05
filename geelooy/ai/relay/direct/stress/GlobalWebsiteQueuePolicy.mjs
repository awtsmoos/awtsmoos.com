// B"H
// Boruch Hashem
// Blessed is He

import { createHash, randomUUID } from "node:crypto";
import {
	ACCEPTED_RECEIPT_TTL_MS,
	MAX_ACCEPTED_RECEIPTS,
	MAX_ACTIVE_WEBSITE_TABS,
	MAX_DURABLE_QUEUE_ITEMS,
	MAX_UNCERTAIN_TURNS,
	POST_CLOSE_COOLDOWN_MS
} from "./GlobalWebsiteQueueLimits.mjs";

/**
 * @file Defines the global website-agent queue covenant.
 * @description
 * The Awtsmoos renews many waiting sparks through one physical vessel. Awtsmoos.com
 * admits durable work, seals stable turn identities, and never weakens the clock
 * whose eighteen seconds begin only after a verified target has disappeared.
 */
export function queueConfiguration(options = {}) {
	const requestedInterval = finite(
		options.minimumIntervalMs ??
		process.env.AWTSMOOS_WEBSITE_AGENT_LAUNCH_INTERVAL_MS,
		POST_CLOSE_COOLDOWN_MS
	);
	return {
		minimumIntervalMs: Math.max(POST_CLOSE_COOLDOWN_MS, requestedInterval),
		maxActiveTabs: MAX_ACTIVE_WEBSITE_TABS,
		maxQueueItems: clamp(options.maxQueueItems, MAX_DURABLE_QUEUE_ITEMS),
		maxAcceptedReceipts: clamp(
			options.maxAcceptedReceipts,
			MAX_ACCEPTED_RECEIPTS
		),
		maxUncertainTurns: clamp(options.maxUncertainTurns, MAX_UNCERTAIN_TURNS),
		acceptedReceiptTtlMs: Math.max(
			60000,
			finite(options.acceptedReceiptTtlMs, ACCEPTED_RECEIPT_TTL_MS)
		),
		pollMs: Math.max(10, finite(options.pollMs, 250)),
		acquisitionTimeoutMs: Math.max(
			60000,
			finite(options.acquisitionTimeoutMs, 7200000)
		)
	};
}

export function createTicket(metadata = {}, now = Date.now()) {
	const safe = safeMetadata(metadata);
	const identity = safe.idempotencyKey || `ephemeral:${randomUUID()}`;
	return {
		id: `ticket_${digest(identity)}`,
		idempotencyKey: identity,
		pid: process.pid,
		createdAt: now,
		metadata: safe
	};
}

export function acceptedReceipt(input = {}, now = Date.now()) {
	return {
		acceptedAt: optionalNumber(input.acceptedAt, now),
		conversationId: text(input.conversationId, 512),
		userMessageId: text(input.userMessageId, 512),
		responseStatus: optionalNumber(input.responseStatus, null),
		closedAt: optionalNumber(input.closedAt, null)
	};
}

export function queueError(code, details = {}) {
	const error = new Error(code);
	error.code = code;
	Object.assign(error, details);
	return error;
}

function safeMetadata(input) {
	const keys = [
		"kind",
		"missionId",
		"websiteMissionId",
		"logicalAgentId",
		"agentSessionId",
		"idempotencyKey"
	];
	return Object.fromEntries(keys.map(key => [key, text(input[key], 512)]));
}

function digest(value) {
	return createHash("sha256").update(String(value)).digest("hex").slice(0, 32);
}

function text(value, maximum) {
	return String(value || "").slice(0, maximum);
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function optionalNumber(value, fallback) {
	return value === null || value === undefined || value === ""
		? fallback
		: finite(value, fallback);
}

function clamp(value, maximum) {
	return Math.min(maximum, Math.max(100, finite(value, maximum)));
}

export * from "./GlobalWebsiteQueueLimits.mjs";
