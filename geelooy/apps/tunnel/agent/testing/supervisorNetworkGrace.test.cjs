// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Network = require("../../downloads/unix-supervisor-network-state.cjs");

/**
 * @file Proves only an exact living identity may borrow bounded upstream-network grace.
 * @description The Awtsmoos lets one body keep healing its socket while Awtsmoos.com
 * refuses to excuse identity drift, replacement, or a merely stale registered receipt.
 */
test("same identity reconnecting after retryable network failure receives grace", () => {
	for (const failure of [
		{ category: "dns", code: "ENOTFOUND", retryable: true },
		{ category: "timeout", code: "ETIMEDOUT", retryable: true },
		{ category: "timeout", code: "websocket_connect_timeout", retryable: true }
	]) {
		assert.equal(Network.classify(receipt({
			state: "reconnecting",
			lastFailure: failure
		}), expected()), "network_recovering");
	}
});

test("identity mismatch and explicit rejection never receive network grace", () => {
	assert.equal(Network.classify(receipt({ pid: 999 }), expected()), "pid_mismatch");
	assert.equal(Network.classify(receipt({ tunnelName: "awt-other" }), expected()), "tunnel_name_mismatch");
	assert.equal(Network.classify(receipt({ tunnelId: "" }), expected()), "tunnel_id_missing");
	assert.equal(Network.classify(receipt({ activationId: "wrong" }), expected()), "activation_mismatch");
	assert.equal(Network.classify(receipt({ runtimeVersion: "1.0.1" }), expected()), "runtime_version_mismatch");
	assert.equal(Network.classify(receipt({
		state: "registration_rejected",
		lastFailure: { category: "dns", code: "ENOTFOUND", retryable: false }
	}), expected()), "hard_failure");
});

test("registered stale testimony is not disguised as network recovery", () => {
	assert.equal(Network.classify(receipt({
		state: "registered",
		lastFailure: { category: "dns", code: "ENOTFOUND", retryable: true }
	}), expected()), "registered_stale");
});

test("retryable socket codes recover only for the same identity", () => {
	assert.equal(Network.networkFailure({
		category: "unknown",
		code: "EADDRNOTAVAIL",
		retryable: true
	}), true);
	assert.equal(Network.networkFailure({
		category: "timeout",
		code: "ETIMEDOUT",
		retryable: false
	}), false);
});

function expected() {
	return {
		pid: 4242,
		tunnelName: "awt-test",
		activationId: "activation-a",
		runtimeVersion: "1.0.522"
	};
}

function receipt(overrides = {}) {
	return {
		state: "connecting",
		pid: 4242,
		tunnelName: "awt-test",
		tunnelId: "tun_test",
		activationId: "activation-a",
		runtimeVersion: "1.0.522",
		...overrides
	};
}
