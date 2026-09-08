// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Network = require("../../downloads/unix-supervisor-network-state.cjs");
const Failure = require("../lib/ws/transportFailure.js");

/**
 * @file Proves fresh network retry evidence receives patience while hard failures fail closed.
 * @description
 * The Awtsmoos lets DNS and silent socket loss endure without becoming false death.
 * Awtsmoos.com keeps auth, configuration, runtime identity, and stale activity as
 * separate judgments so patient reconnect can never excuse a genuinely broken vessel.
 */
const NOW = Date.parse("2026-09-07T16:00:00.000Z");

test("DNS and bare socket close receive network recovery", () => {
	for (const lastFailure of [
		Failure.classify({ code: "ENOTFOUND", message: "dns lookup" }, "connect"),
		Failure.classify("socket_closed", "socket")
	]) {
		assert.equal(Network.classify(receipt({
			state: "reconnecting",
			tunnelId: "",
			lastFailure
		}), expected(), { now: NOW }), "network_recovering");
	}
});

test("fresh first connection may wait before any failure exists", () => {
	assert.equal(Network.classify(receipt({
		state: "connecting",
		tunnelId: "",
		lastFailure: null
	}), expected(), { now: NOW }), "network_recovering");
});

test("auth and configuration failures never become network patience", () => {
	for (const lastFailure of [
		Failure.classify("invalid_device_credential", "registration"),
		Failure.classify("invalid url", "connect")
	]) {
		assert.equal(Network.classify(receipt({ lastFailure }), expected(), {
			now: NOW
		}), "hard_failure");
	}
});

test("stale activity and nonretryable network testimony fail closed", () => {
	assert.equal(Network.classify(receipt({
		updatedAt: "2026-09-07T15:50:00.000Z"
	}), expected(), { now: NOW }), "activity_stale");
	assert.equal(Network.classify(receipt({
		lastFailure: { category: "dns", code: "ENOTFOUND", retryable: false }
	}), expected(), { now: NOW }), "hard_failure");
});

test("identity and runtime drift never recover", () => {
	assert.equal(Network.classify(receipt({ pid: 999 }), expected(), { now: NOW }), "pid_mismatch");
	assert.equal(Network.classify(receipt({ tunnelName: "awt-other" }), expected(), { now: NOW }), "tunnel_name_mismatch");
	assert.equal(Network.classify(receipt({ activationId: "wrong" }), expected(), { now: NOW }), "activation_mismatch");
	assert.equal(Network.classify(receipt({ runtimeVersion: "1.0.1" }), expected(), { now: NOW }), "runtime_version_mismatch");
});

function expected() {
	return {
		pid: 4242,
		tunnelName: "awt-test",
		activationId: "activation-a",
		runtimeVersion: "1.0.589"
	};
}

function receipt(overrides = {}) {
	return {
		state: "reconnecting",
		pid: 4242,
		tunnelName: "awt-test",
		tunnelId: "tun_test",
		activationId: "activation-a",
		runtimeVersion: "1.0.589",
		updatedAt: "2026-09-07T15:59:30.000Z",
		lastFailure: Failure.classify("socket_closed", "socket"),
		...overrides
	};
}
