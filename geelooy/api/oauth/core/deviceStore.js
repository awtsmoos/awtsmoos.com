// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Authorization state machine for Awtsmoos.com OAuth device sessions.
 * @description
 * The Awtsmoos lets the hidden daemon request wait beneath the human decision;
 * Awtsmoos.com keeps approval, denial, cadence, client binding, and one-time
 * redemption here while a separate index vessel owns maps and expiry tombstones.
 */

const Indexes = require("./deviceIndexes.js");
const Policy = require("./devicePolicy.js");

function createDeviceRecord(details, now = Date.now()) {
	return Indexes.createRecord(details, now);
}

function readByUserCode(userCode, now = Date.now()) {
	Indexes.cleanupExpired(now);
	return Indexes.getByUserCode(userCode);
}

function approveUserCode(userCode, userId, now = Date.now()) {
	const record = readByUserCode(userCode, now);
	if (!record || record.status !== "pending") {
		return record;
	}
	record.status = "approved";
	record.userId = userId;
	record.decidedAt = now;
	return record;
}

function denyUserCode(userCode, userId, now = Date.now()) {
	const record = readByUserCode(userCode, now);
	if (!record || record.status !== "pending") {
		return record;
	}
	record.status = "denied";
	record.userId = userId;
	record.decidedAt = now;
	return record;
}

function pollTooSoon(record, now) {
	const elapsed = now - record.lastPollAt;
	if (!record.lastPollAt || elapsed >= (record.intervalSeconds * 1000)) {
		return null;
	}
	record.intervalSeconds += Policy.DEVICE_SLOW_DOWN_SECONDS;
	record.lastPollAt = now;
	return {
		ok: false,
		error: "slow_down",
		retryAfter: record.intervalSeconds
	};
}

function terminalPoll(record) {
	if (record.status === "pending") {
		return {
			ok: false,
			error: "authorization_pending",
			retryAfter: record.intervalSeconds
		};
	}
	if (record.status === "denied") {
		Indexes.removeRecord(record);
		return { ok: false, error: "access_denied" };
	}
	if (record.status === "approved") {
		Indexes.removeRecord(record);
		return { ok: true, record };
	}
	return { ok: false, error: "invalid_grant" };
}

function pollDeviceCode(deviceCode, clientId, now = Date.now()) {
	Indexes.cleanupExpired(now);
	const record = Indexes.getByDeviceCode(deviceCode);
	if (!record) {
		return Indexes.wasExpired(deviceCode)
			? { ok: false, error: "expired_token" }
			: { ok: false, error: "invalid_grant" };
	}
	if (record.clientId !== clientId) {
		return { ok: false, error: "invalid_grant" };
	}
	const slowed = pollTooSoon(record, now);
	if (slowed) {
		return slowed;
	}
	record.lastPollAt = now;
	return terminalPoll(record);
}

function cleanupExpired(now = Date.now()) {
	return Indexes.cleanupExpired(now);
}

function resetDeviceStore() {
	Indexes.resetIndexes();
}

module.exports = {
	approveUserCode,
	cleanupExpired,
	createDeviceRecord,
	denyUserCode,
	pollDeviceCode,
	readByUserCode,
	resetDeviceStore
};
