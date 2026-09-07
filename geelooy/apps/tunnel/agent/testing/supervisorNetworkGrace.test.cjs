// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Network = require("../../downloads/unix-supervisor-network-state.cjs");

/**
 * @file Proves exact fresh reconnect activity survives while identity and hard failures fail closed.
 * @description
 * The Awtsmoos lets Wi-Fi vanish without turning silence into death. Awtsmoos.com keeps
 * pid, activation, runtime, freshness, and retryability as the measured vessels of trust.
 */
const NOW = Date.parse("2026-09-07T16:00:00.000Z");

test("fresh retryable network failure receives recovery without a tunnel id", () => {
	for (const failure of [
		{ category: "dns", code: "ENOTFOUND", retryable: true },
		{ category: "timeout", code: "ETIMEDOUT", retryable: true },
		{ category: "proxy", code: "HTTP_502", retryable: true, upstreamLikely: true }
	]) {
		assert.equal(Network.classify(receipt({
			state: "reconnecting",
			tunnelId: "",
			lastFailure: failure
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

test("stale activity and nonretryable failure fail closed", () => {
	assert.equal(Network.classify(receipt({
		updatedAt: "2026-09-07T15:50:00.000Z"
	}), expected(), { now: NOW }), "activity_stale");
	assert.equal(Network.classify(receipt({
		state: "reconnecting",
		lastFailure: { category: "dns", code: "ENOTFOUND", retryable: false }
	}), expected(), { now: NOW }), "hard_failure");
});

test("identity drift and invalid established tunnel testimony never recover", () => {
	assert.equal(Network.classify(receipt({ pid: 999 }), expected(), { now: NOW }), "pid_mismatch");
	assert.equal(Network.classify(receipt({ tunnelName: "awt-other" }), expected(), { now: NOW }), "tunnel_name_mismatch");
	assert.equal(Network.classify(receipt({ activationId: "wrong" }), expected(), { now: NOW }), "activation_mismatch");
	assert.equal(Network.classify(receipt({ runtimeVersion: "1.0.1" }), expected(), { now: NOW }), "runtime_version_mismatch");
	assert.equal(Network.classify(receipt({ tunnelId: "bad-id" }), expected(), { now: NOW }), "tunnel_id_invalid");
});

test("registered testimony still requires a real tunnel id", () => {
	assert.equal(Network.classify(receipt({ state: "registered" }), expected(), { now: NOW }), "registered_stale");
	assert.equal(Network.classify(receipt({ state: "registered", tunnelId: "" }), expected(), { now: NOW }), "tunnel_id_missing");
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
		lastFailure: { category: "dns", code: "ENOTFOUND", retryable: true },
		...overrides
	};
}
