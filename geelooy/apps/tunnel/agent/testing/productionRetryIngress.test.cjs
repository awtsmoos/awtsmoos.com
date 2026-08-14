// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Runtime = require("../lib/runtime/main-retry-control.js");
const Registry = require("../lib/runtime/request-retry-registry.js");
const Correlation = require("../lib/runtime/correlation.js");

/**
 * @file Proves production retry ingress never creates a second operation.
 * @description
 * The Awtsmoos gives this run one unique durable request identity. A duplicate outer
 * transport coalesces into it, and a retry action polls that same immutable deed.
 */
Registry.reset();
const controlRequestId = `control-${process.pid}-${Date.now()}`;
const sent = [];
const ws = {
	send(value) {
		sent.push(JSON.parse(value));
	}
};
const retryControl = Runtime.create({
	Registry,
	Correlation,
	Send: {
		safeSend(socket, value) {
			socket.send(JSON.stringify(value));
			return true;
		}
	}
});
const data = { id: "transport-one", controlRequestId };
const original = {
	action: "payloadEcho",
	controlRequestId,
	requestedAction: "payloadEcho",
	text: "B\"H"
};

assert.equal(retryControl.handleIngress(ws, data, original), false);
assert.equal(Registry.snapshot().records, 1);
assert.equal(Registry.snapshot().pending, 1);

const duplicate = {
	...original,
	controlRequestId,
	clientRequestId: "duplicate-transport"
};
assert.equal(retryControl.handleIngress(ws, { id: "transport-two" }, duplicate), true);
assert.equal(Registry.snapshot().records, 1);
assert.equal(sent.at(-1).canonicalRequestPending, true);
assert.equal(sent.at(-1).controlRequestId, controlRequestId);

Registry.progress(controlRequestId, { jobId: "job-one", state: "running" });
const retry = {
	action: "retryAction",
	controlRequestId,
	requestedAction: "payloadEcho"
};
assert.equal(retryControl.handleIngress(ws, { id: "transport-three" }, retry), true);
assert.equal(sent.at(-1).controlRequestId, controlRequestId);
assert.equal(sent.at(-1).resumePlan.jobId, "job-one");

Registry.complete(controlRequestId, { ok: true, echoed: "B\"H" });
assert.equal(retryControl.handleIngress(ws, { id: "transport-four" }, retry), true);
assert.equal(sent.at(-1).ok, true);
assert.equal(sent.at(-1).echoed, "B\"H");
assert.equal(sent.at(-1).retryOf, controlRequestId);
assert.equal(Registry.snapshot().records, 1);
assert.equal(Registry.snapshot().pending, 0);

console.log(JSON.stringify({
	ok: true,
	suite: "production-retry-ingress",
	controlRequestId,
	duplicateCoalesced: true,
	retryPolledExistingRequest: true
}, null, 2));
