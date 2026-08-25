// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Surface = require("../lib/runtime/response-surface.js");

/**
 * @file Proves ordinary responses stay small while diagnostics remain explicitly recoverable.
 * @description
 * The Awtsmoos lets testimony travel lightly. Awtsmoos.com keeps one stability witness
 * by default and returns the engine room only when a diagnostic or full vessel is requested.
 */
const full = fixture();
const simple = Surface.publicEnvelope(full, {}, {});
const diagnostic = Surface.publicEnvelope(full, { responseMode: "diagnostic" }, {});
const raw = Surface.publicEnvelope(full, { responseMode: "full" }, {});

assert.equal(simple.stdout, "completed");
assert.equal(simple.queueStats, undefined);
assert.equal(simple.workers, undefined);
assert.equal(simple.worker, undefined);
assert.equal(simple.receipt, undefined);
assert.equal(simple.processIdentity, undefined);
assert.equal(simple.stability.state, "healthy");
assert.equal(simple.stability.inflight, 7);
assert.equal(simple.stability.filesystem.workers, 16);
assert.equal(simple.instructionProtocol.resolveAction, "instructionResolve");
assert.equal(simple.responseShape, "simple-envelope-v11");

assert.ok(diagnostic.queueStats);
assert.ok(diagnostic.workers);
assert.ok(diagnostic.receipt);
assert.equal(raw, full);
assert.ok(JSON.stringify(simple).length < JSON.stringify(full).length * 0.35);

console.log(JSON.stringify({
	ok: true,
	suite: "response-surface-focus",
	fullBytes: JSON.stringify(full).length,
	simpleBytes: JSON.stringify(simple).length
}));

/** Builds a deliberately noisy result large enough to expose accidental telemetry leakage. */
function fixture() {
	const repeated = Array.from({ length: 40 }, (_, index) => ({ index, state: "healthy", detail: "x".repeat(80) }));
	return {
		ok: true,
		action: "commandRun",
		actualAction: "commandRun",
		stdout: "completed",
		queueStats: {
			inflight: 7,
			queued: 3,
			circuit: { level: "closed", pressureLagMs: 12 },
			eventLoopLag: { lastMs: 8 },
			filesystemExecutor: { busy: 3, queued: 2, ready: 13, workers: 16, workerLimit: 16 },
			workers: { activeTotal: 9, current: { staleHeartbeats: 0, reaping: 0 }, reaper: { totalTimeouts: 0 } },
			connection: { executionHealth: { state: "healthy", inflight: 7, queued: 3 } },
			lanes: Object.fromEntries(repeated.map(item => [`lane-${item.index}`, item]))
		},
		workers: { active: repeated },
		worker: { id: "worker-1", detail: repeated },
		receipt: { receiptId: "receipt-1", history: repeated },
		processIdentity: { pid: 123, detail: repeated },
		cleanup: { detail: repeated }
	};
}
