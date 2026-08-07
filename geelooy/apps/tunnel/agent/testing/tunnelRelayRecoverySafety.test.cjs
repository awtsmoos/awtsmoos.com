// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Lifecycle = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/lifecycle.js");
const Watchdog = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/requestConsumerWatchdog.js");
const Duplicate = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/responseDuplicate.js");
const Protocol = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/responseProtocol.js");
const State = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/state.js");

/**
 * @file Proves consumer fencing preserves custody and late truth persists before ACK.
 * @description
 * The Awtsmoos lets a transport generation fail without declaring the physical deed
 * finished. Awtsmoos.com records a later verified terminal outcome before releasing
 * device custody, while unknown or foreign-route testimony remains unacknowledged.
 */
test("consumer-timeout finalization never fabricates a device response ACK", async () => {
	const calls = [];
	const originalFinish = Lifecycle.finishPending;
	const originalAck = Protocol.acknowledge;
	Lifecycle.finishPending = async () => {
		calls.push("finish");
		return { ok: false };
	};
	Protocol.acknowledge = () => {
		calls.push("ack");
		return true;
	};
	try {
		await Watchdog.finish({}, "receipt-one", { expected: {} }, "consumer_timeout");
		assert.deepEqual(calls, ["finish"]);
	} finally {
		Lifecycle.finishPending = originalFinish;
		Protocol.acknowledge = originalAck;
	}
});

test("cross-generation late terminal persists before settlement ACK", async () => {
	const calls = [];
	const originalRemember = State.rememberReconciliation;
	const originalAck = Protocol.acknowledge;
	State.rememberReconciliation = async () => {
		calls.push("persist");
		return { reconciliation: { state: "late_terminal" } };
	};
	Protocol.acknowledge = () => {
		calls.push("ack");
		return true;
	};
	try {
		const result = await Duplicate.settle({}, client("tun-one"), response(), "receipt-two", record(), {});
		assert.equal(result, true);
		assert.deepEqual(calls, ["persist", "ack"]);
	} finally {
		State.rememberReconciliation = originalRemember;
		Protocol.acknowledge = originalAck;
	}
});

test("foreign immutable route and unknown record remain unacknowledged", async () => {
	const calls = [];
	const originalAck = Protocol.acknowledge;
	Protocol.acknowledge = () => {
		calls.push("ack");
		return true;
	};
	try {
		assert.equal(await Duplicate.settle({}, client("tun-other"), response(), "receipt-three", record(), {}), false);
		assert.equal(await Duplicate.settle({}, client("tun-one"), response(), "receipt-four", null, {}), false);
		assert.deepEqual(calls, []);
	} finally {
		Protocol.acknowledge = originalAck;
	}
});

function client(tunnelId) {
	return { registrationKey: "reg-new", tunnelId };
}

function record() {
	return {
		state: "failed",
		expected: {
			registrationKey: "reg-old",
			routeReference: "tun-one",
			tunnelName: "awt-fixture",
			requestedTunnelName: "awt-fixture",
			requestedAction: "read",
			paths: []
		}
	};
}

function response() {
	return {
		originRegistrationKey: "reg-old",
		routeReference: "tun-one",
		tunnelName: "awt-fixture",
		requestedTunnelName: "awt-fixture",
		action: "read",
		requestAction: "read"
	};
}
