// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Dual indexes and expiry tombstones for Awtsmoos.com device authorization.
 * @description
 * The Awtsmoos lets one pending request be found by a hidden machine code or a
 * visible human code without confusing the two; Awtsmoos.com keeps those indexes,
 * expiry cleanup, and short tombstones in one small storage vessel.
 */

const Codes = require("./deviceCodes.js");
const Policy = require("./devicePolicy.js");

const deviceIndex = globalThis.__awtsmoosOAuthDeviceIndex || new Map();
const userIndex = globalThis.__awtsmoosOAuthUserCodeIndex || new Map();
const expiredIndex = globalThis.__awtsmoosOAuthExpiredDeviceIndex || new Map();
globalThis.__awtsmoosOAuthDeviceIndex = deviceIndex;
globalThis.__awtsmoosOAuthUserCodeIndex = userIndex;
globalThis.__awtsmoosOAuthExpiredDeviceIndex = expiredIndex;

function removeRecord(record) {
	deviceIndex.delete(record.deviceCode);
	userIndex.delete(Codes.normalizeUserCode(record.userCode));
}

function markExpired(record, now) {
	removeRecord(record);
	expiredIndex.set(
		record.deviceCode,
		now + (Policy.DEVICE_EXPIRY_TOMBSTONE_SECONDS * 1000)
	);
}

function cleanupExpired(now = Date.now()) {
	for (const record of deviceIndex.values()) {
		if (record.expiresAt <= now) {
			markExpired(record, now);
		}
	}
	for (const [deviceCode, purgeAt] of expiredIndex.entries()) {
		if (purgeAt <= now) {
			expiredIndex.delete(deviceCode);
		}
	}
}

function uniqueUserCode() {
	let userCode = Codes.makeUserCode();
	while (userIndex.has(Codes.normalizeUserCode(userCode))) {
		userCode = Codes.makeUserCode();
	}
	return userCode;
}

function createRecord(details, now = Date.now()) {
	cleanupExpired(now);
	let deviceCode = Codes.makeDeviceCode();
	while (deviceIndex.has(deviceCode)) {
		deviceCode = Codes.makeDeviceCode();
	}
	const userCode = uniqueUserCode();
	const record = {
		deviceCode,
		userCode,
		clientId: details.clientId,
		scope: details.scope,
		status: "pending",
		userId: null,
		createdAt: now,
		expiresAt: now + (Policy.DEVICE_TTL_SECONDS * 1000),
		intervalSeconds: Policy.DEVICE_POLL_INTERVAL_SECONDS,
		lastPollAt: 0,
		decidedAt: 0
	};
	deviceIndex.set(deviceCode, record);
	userIndex.set(Codes.normalizeUserCode(userCode), record);
	return record;
}

function getByDeviceCode(deviceCode) {
	return deviceIndex.get(String(deviceCode || "")) || null;
}

function getByUserCode(userCode) {
	return userIndex.get(Codes.normalizeUserCode(userCode)) || null;
}

function wasExpired(deviceCode) {
	return expiredIndex.has(String(deviceCode || ""));
}

function resetIndexes() {
	deviceIndex.clear();
	userIndex.clear();
	expiredIndex.clear();
}

module.exports = {
	cleanupExpired,
	createRecord,
	getByDeviceCode,
	getByUserCode,
	removeRecord,
	resetIndexes,
	wasExpired
};
