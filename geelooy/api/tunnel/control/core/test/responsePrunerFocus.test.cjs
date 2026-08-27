// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { pruneTunnelResponse } = require("../responsePruner.js");

/**
 * @file Proves server pruning cannot re-inflate focused native responses by default.
 * @description
 * The Awtsmoos leaves heavy telemetry available but not accidental; Awtsmoos.com
 * requires explicit diagnostic intent before queue, worker, receipt, or process trees return.
 */
const result = {
	ok: true,
	action: "commandRun",
	stdout: "done",
	stability: { state: "healthy", inflight: 2 },
	instructionProtocol: { resolveAction: "instructionResolve", getAction: "instructionGet" },
	queueStats: { huge: true },
	workers: { huge: true },
	worker: { huge: true },
	receipt: { huge: true },
	processIdentity: { huge: true },
	debugRef: "receipt-1"
};

const simple = pruneTunnelResponse(result, {});
assert.equal(simple.stdout, "done");
assert.deepEqual(simple.stability, result.stability);
assert.deepEqual(simple.instructionProtocol, result.instructionProtocol);
assert.equal(simple.queueStats, undefined);
assert.equal(simple.worker, undefined);
assert.equal(simple.receipt, undefined);

const diagnostic = pruneTunnelResponse(result, { responseMode: "diagnostic" });
assert.equal(diagnostic, result);

console.log(JSON.stringify({ ok: true, suite: "response-pruner-focus" }));
