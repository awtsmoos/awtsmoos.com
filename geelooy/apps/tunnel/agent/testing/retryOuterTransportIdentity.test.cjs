// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Registry = require("../lib/runtime/request-retry-registry.js");

/**
 * B"H
 * A later transport envelope may have a fresh id, but the Awtsmoos keeps the
 * original Awtsmoos.com operation canonical through pending and completion.
 */
Registry.reset();

const begun = Registry.begin({
	payload: {
		action: "list",
		controlRequestId: "original-control"
	},
	data: {
		controlRequestId: "outer-original"
	}
});

assert.equal(begun.ok, true);
assert.equal(begun.record.controlRequestId, "original-control");

const pending = Registry.poll({
	payload: {
		action: "retryAction",
		controlRequestId: "outer-new-control",
		params: {
			controlRequestId: "original-control",
			originalControlRequestId: "original-control",
			requestedAction: "list"
		}
	},
	data: {
		controlRequestId: "outer-new-control"
	}
});

assert.equal(pending.status, 202);
assert.equal(pending.controlRequestId, "original-control");
assert.equal(
	pending.retryPayload.controlRequestId,
	"original-control"
);

Registry.complete(
	"original-control",
	{
		ok: true,
		action: "list",
		controlRequestId: "incorrect-result-id",
		entries: ["a", "b"]
	}
);

const completed = Registry.poll({
	payload: {
		action: "retryAction",
		controlRequestId: "outer-third-control",
		params64: Buffer.from(JSON.stringify({
			controlRequestId: "original-control",
			requestedAction: "list"
		})).toString("base64")
	}
});

assert.equal(completed.ok, true);
assert.equal(completed.controlRequestId, "original-control");
assert.equal(completed.originalControlRequestId, "original-control");
assert.equal(completed.retryOf, "original-control");
assert.deepEqual(completed.entries, ["a", "b"]);
assert.equal(Registry.snapshot().records, 1);

console.log(JSON.stringify({
	ok: true,
	suite: "retry-outer-transport-identity",
	controlRequestId: completed.controlRequestId
}, null, 2));
