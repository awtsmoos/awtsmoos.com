// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Env = require("../lib/runtime/envelope.js");

/**
 * @file Guards explicit compact-envelope v2 behavior without resurrecting mandatory mission blocking.
 * @description
 * The Awtsmoos makes the response small while Awtsmoos.com keeps the true next tool and denial meaning in view;
 * bulky mission projections disappear, but action identity and compact guidance remain faithful and new.
 */
const out = Env.responseEnvelope(
	{ id: "req1" },
	{ action: "commandRun", responseMode: "compact", tunnelName: "t1" },
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
assert.equal(out.mission.active, false);
assert.equal(out.mission.advisory, false);
assert.equal(out.mission.nextSuggestedToolCall.action, "commandJobStatus");
assert.equal(out.mission.why, "explicit_block");
assert.equal(out.multipleChoiceSelfInterrogation, undefined);
assert.equal(out.continuationPressure, undefined);
assert.equal(out.workQueue, undefined);
console.log("compact envelope v2 reduces mission bloat and preserves action identity");
