// B"H

const assert = require("node:assert/strict");
const Envelopes = require("../envelopePending.js");

const result = Envelopes.timeoutEnvelope({
	controlRequestId: "control-one",
	requestedAction: "commandWait",
	tunnelName: "friendly-name",
	routeReference: "tun_immutable_one",
	timeoutMs: 60000
}, 1000, 60000);

assert.equal(result.next.tunnelName, "friendly-name");
assert.equal(result.next.routeReference, "tun_immutable_one");
assert.equal(result.routeReference, "tun_immutable_one");
assert.equal(result.retryPayload.controlRequestId, "control-one");

console.log(JSON.stringify({
	ok: true,
	suite: "pending-immutable-route",
	friendlyDisplayPreserved: true,
	immutableRetryRoutePreserved: true
}));
