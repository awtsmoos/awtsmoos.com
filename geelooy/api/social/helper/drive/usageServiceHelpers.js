//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module usageServiceHelpers
 * @description
 * Transfer leases, rate windows, monthly usage and traffic pruning helpers.
 */

const crypto = require('crypto');
const { mutateDriveState, readDriveState } = require('./stateRepository.js');
const { monthKey } = require('./stateShape.js');
const { mergedQuota, quotaWarnings, quotaError } = require('./quotaPolicy.js');

const LEASE_LIFETIME_MS = 15 * 60 * 1000;

function createTransferLease(state, quota, kind = 'transfer') {
	if (Object.keys(state.transferLeases).length >= quota.concurrentTransfers) {
		throw quotaError('CONCURRENT_TRANSFER_LIMIT_EXCEEDED');
	}
	const id = crypto.randomUUID();
	state.transferLeases[id] = {
		id,
		kind: String(kind),
		createdAt: Date.now(),
		expiresAt: Date.now() + LEASE_LIFETIME_MS
	};
	return id;
}

function currentRateWindow(state) {
	const key = new Date().toISOString().slice(0, 16);
	state.rateWindows[key] ||= { requests: 0, uploads: 0 };
	return state.rateWindows[key];
}

function currentMonthUsage(state) {
	const key = monthKey();
	state.usage.monthly[key] ||= { requests: 0, ingressBytes: 0, egressBytes: 0 };
	return state.usage.monthly[key];
}

function pruneTrafficState(state) {
	const now = Date.now();
	for (const [id, lease] of Object.entries(state.transferLeases || {})) {
		if (Number(lease.expiresAt || 0) <= now) delete state.transferLeases[id];
	}
	const activeMinute = new Date().toISOString().slice(0, 16);
	for (const key of Object.keys(state.rateWindows || {})) {
		if (key !== activeMinute) delete state.rateWindows[key];
	}
}

function safeBytes(value) {
	const number = Number(value || 0);
	return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}

module.exports = {
	LEASE_LIFETIME_MS,
	createTransferLease,
	currentRateWindow,
	currentMonthUsage,
	pruneTrafficState,
	safeBytes
};
