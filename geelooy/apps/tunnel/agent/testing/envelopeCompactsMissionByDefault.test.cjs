// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Env = require("../lib/runtime/envelope.js");

/**
 * @file Guards compact-envelope v2 as the default response surface.
 * @description
 * The Awtsmoos makes the ordinary response small while Awtsmoos.com keeps the next safe deed visible;
 * mission bloat falls away, yet action identity and compact guidance remain truthful and livable.
 */
const out = Env.responseEnvelope(
	{ id: "req-default" },
	{ action: "commandRun", tunnelName: "t1" },
	{
		ok: true,
		action: "commandRun",
		requestAction: "commandRun",
		summary: "Started worker.",
		finalAnswerAllowed: false,
		mustContinue: true,
		multipleChoiceSelfInterrogation: { giant: true },
		continuationPressure: { releaseBlockedBecause: "unfinished verification" },
		workQueue: { huge: true },
		nextRequiredToolCall: { action: "commandJobStatus", jobId: "cmd1" }
	},
	Date.now(),
	() => ({ workers: { active: {} } })
);

assert.equal(out.action, "commandRun");
assert.equal(out.responseShape, "compact-envelope-v2");
assert.equal(out.mission.nextSuggestedToolCall.action, "commandJobStatus");
assert.equal(out.multipleChoiceSelfInterrogation, undefined);
assert.equal(out.continuationPressure, undefined);
assert.equal(out.workQueue, undefined);
console.log("compact envelope v2 is default and preserves commandRun identity");
