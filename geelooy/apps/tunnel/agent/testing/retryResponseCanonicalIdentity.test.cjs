// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const RetryControl = require("../lib/runtime/main-retry-control.js");

const sent = [];
const control = RetryControl.create({
	Registry: {
		poll() {
			return {
				ok: false,
				status: 202,
				controlRequestId: "original-control",
				requestedAction: "list"
			};
		},
		begin() {
			return {
				ok: true,
				kind: "created"
			};
		},
		requestIdentity() {
			return {
				controlRequestId: "original-control"
			};
		},
		progress() {},
		complete() {}
	},
	Correlation: {
		fields() {
			return {
				controlRequestId: "outer-new-control",
				nonce: "nonce-one"
			};
		}
	},
	Send: {
		safeSend(_ws, value) {
			sent.push(value);
			return true;
		}
	}
});

control.handleIngress(
	{
		opened: true
	},
	{
		id: "transport-new"
	},
	{
		action: "retryAction",
		controlRequestId: "outer-new-control",
		params: {
			controlRequestId: "original-control",
			requestedAction: "list"
		}
	}
);

assert.equal(
	sent.at(-1).controlRequestId,
	"original-control"
);
assert.equal(
	sent.at(-1).id,
	"transport-new"
);
assert.equal(
	sent.at(-1).nonce,
	"nonce-one"
);

console.log(JSON.stringify({
	ok: true,
	suite: "retry-response-canonical-identity"
}, null, 2));
