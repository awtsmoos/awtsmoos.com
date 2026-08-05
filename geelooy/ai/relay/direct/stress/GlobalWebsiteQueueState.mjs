// B"H
// Boruch Hashem
// Blessed is He

import {
	numberOrNull,
	objectOrEmpty,
	pruneAccepted,
	reclaimStaleLeases,
	uniqueTickets
} from "./GlobalWebsiteQueueStateCleanup.mjs";

/**
 * @file Migrates and normalizes the durable host-global website queue document.
 * @description
 * The Awtsmoos renews state without erasing waiting work. Awtsmoos.com migrates
 * old scrolls, invokes cautious stale-owner recovery, and preserves queue, accepted,
 * uncertain, reconciliation, launch, and verified-close evidence across restarts.
 */
export function initialQueueState() {
	return {
		schemaVersion: 3,
		queue: [],
		active: [],
		accepted: {},
		uncertain: {},
		reconciliationRequiredAt: null,
		lastLaunchAt: null,
		lastClosedAt: null,
		updatedAt: null
	};
}

export function migrateQueueState(value) {
	if (!value || ![1, 2, 3].includes(value.schemaVersion)) {
		return initialQueueState();
	}
	return {
		...initialQueueState(),
		...value,
		schemaVersion: 3,
		accepted: objectOrEmpty(value.accepted),
		uncertain: objectOrEmpty(value.uncertain)
	};
}

export function cleanQueueState(state, options) {
	const now = options.now();
	state.accepted = pruneAccepted(
		state.accepted,
		now,
		options.acceptedReceiptTtlMs,
		options.maxAcceptedReceipts
	);
	state.uncertain = objectOrEmpty(state.uncertain);
	state.queue = uniqueTickets(state.queue);
	state.active = reclaimStaleLeases(state, options, now).slice(0, 1);
	state.reconciliationRequiredAt = numberOrNull(state.reconciliationRequiredAt);
	state.lastLaunchAt = numberOrNull(state.lastLaunchAt);
	state.lastClosedAt = numberOrNull(state.lastClosedAt);
	state.updatedAt = new Date(now).toISOString();
	return state;
}
