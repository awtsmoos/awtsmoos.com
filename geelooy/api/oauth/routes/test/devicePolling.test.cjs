// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves RFC-style polling cadence and terminal device states.
 * @description
 * The Awtsmoos lets a silent client ask only at a bounded rhythm; these tests
 * prove Awtsmoos.com returns pending, slows impatience, binds the right client,
 * respects denial and expiry, and never revives a consumed authorization vessel.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const DeviceStore = require("../../core/deviceStore.js");
const Policy = require("../../core/devicePolicy.js");

const CLIENT_ID = "external-agent";
const SCOPE = "profile tunnel.read tunnel.mission tunnel.room";

function createAt(now = 1000) {
	return DeviceStore.createDeviceRecord({
		clientId: CLIENT_ID,
		scope: SCOPE
	}, now);
}

test.beforeEach(() => {
	DeviceStore.resetDeviceStore();
});

test("pending poll obeys interval and slow_down increases future delay", () => {
	const record = createAt(1000);
	const first = DeviceStore.pollDeviceCode(
		record.deviceCode,
		CLIENT_ID,
		1000
	);
	assert.equal(first.error, "authorization_pending");
	assert.equal(first.retryAfter, 5);
	const early = DeviceStore.pollDeviceCode(
		record.deviceCode,
		CLIENT_ID,
		2000
	);
	assert.equal(early.error, "slow_down");
	assert.equal(early.retryAfter, 10);
	const conforming = DeviceStore.pollDeviceCode(
		record.deviceCode,
		CLIENT_ID,
		12000
	);
	assert.equal(conforming.error, "authorization_pending");
	assert.equal(conforming.retryAfter, 10);
});

test("device code cannot be redeemed by a different client", () => {
	const record = createAt();
	const result = DeviceStore.pollDeviceCode(
		record.deviceCode,
		"grok",
		1000
	);
	assert.equal(result.error, "invalid_grant");
	assert.ok(DeviceStore.readByUserCode(record.userCode, 1000));
});

test("human denial becomes terminal access_denied", () => {
	const record = createAt();
	DeviceStore.denyUserCode(record.userCode, "human-deny", 1500);
	const denied = DeviceStore.pollDeviceCode(
		record.deviceCode,
		CLIENT_ID,
		2000
	);
	assert.equal(denied.error, "access_denied");
	const second = DeviceStore.pollDeviceCode(
		record.deviceCode,
		CLIENT_ID,
		3000
	);
	assert.equal(second.error, "invalid_grant");
});

test("expired device code reports expired_token then ages out", () => {
	const start = 1000;
	const record = createAt(start);
	const expiredAt = start + (Policy.DEVICE_TTL_SECONDS * 1000) + 1;
	const expired = DeviceStore.pollDeviceCode(
		record.deviceCode,
		CLIENT_ID,
		expiredAt
	);
	assert.equal(expired.error, "expired_token");
	assert.equal(DeviceStore.readByUserCode(record.userCode, expiredAt), null);
	const tombstoneEnd = expiredAt
		+ (Policy.DEVICE_EXPIRY_TOMBSTONE_SECONDS * 1000)
		+ 1;
	const gone = DeviceStore.pollDeviceCode(
		record.deviceCode,
		CLIENT_ID,
		tombstoneEnd
	);
	assert.equal(gone.error, "invalid_grant");
});
