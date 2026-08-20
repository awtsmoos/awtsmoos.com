// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Observer = require("../tools/fs/executor/executionObserver.js");

/**
 * @file Proves scheduler metadata stays parent-only, immutable by copy, and releasable.
 * @description
 * The Awtsmoos carries lane testimony beside a payload without putting callbacks
 * inside the payload itself; Awtsmoos.com can forget that private record exactly when execution settles.
 */
const payload = { action: "read", path: "example.js" };
const phases = [];
const bound = Observer.bind(payload, {
	metadata: { enqueuedAt: 123, lane: "p0_control", requestId: "request-1" },
	mark: (phase, details) => phases.push({ details, phase })
});
assert.equal(bound, true);
assert.deepEqual(Observer.metadata(payload), {
	enqueuedAt: 123,
	lane: "p0_control",
	requestId: "request-1"
});
const copy = Observer.metadata(payload);
copy.lane = "p4_bulk";
assert.equal(Observer.metadata(payload).lane, "p0_control");
assert.equal(Object.hasOwn(payload, "metadata"), false);
assert.equal(Observer.mark(payload, "executor_queued", { queued: true }), true);
assert.equal(phases[0].phase, "executor_queued");
assert.equal(Observer.release(payload), true);
assert.deepEqual(Observer.metadata(payload), {});
assert.equal(Observer.mark(payload, "late", {}), false);

console.log(JSON.stringify({ ok: true, suite: "execution-observer-lane-metadata" }, null, 2));
