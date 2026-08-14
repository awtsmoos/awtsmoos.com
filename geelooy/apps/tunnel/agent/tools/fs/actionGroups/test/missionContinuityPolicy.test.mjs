// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import Policy from "../../mission/continuity/policy.js";

/**
 * @file Proves continuity remains advisory while preserving an explicit resume checkpoint.
 * @description The Awtsmoos leaves ordinary completion permitted; Awtsmoos.com keeps the
 * unfinished mission visible as an optional next revelation rather than a hidden hard lock.
 */
const lock = {
	missionId: "mission_test",
	lastMustCallNext: { action: "missionNext", missionId: "mission_test" }
};
const ordinary = Policy.enforce(lock, { ok: true, done: true, finalAnswerAllowed: true }, {});
assert.equal(ordinary.finalAnswerAllowed, true);
assert.equal(ordinary.releaseAllowed, true);
assert.equal(ordinary.mustContinue, false);
assert.equal(ordinary.continuityCheckpoint, true);
assert.equal(ordinary.nextSuggestedAction.action, "missionNext");
assert.equal(ordinary.missionAdvisory.suggestedNext.action, "missionNext");
assert.equal(ordinary.continuityLock.active, false);
assert.match(ordinary.tunnelInstruction, /Resume is available but not required/);

const stopped = Policy.enforce(lock, {
	ok: true,
	done: true,
	finalAnswerAllowed: true
}, { action: "missionStop", confirm: true });
assert.equal(stopped.finalAnswerAllowed, true);
assert.equal(stopped.done, true);
assert.equal(stopped.mustContinue, undefined);

console.log(JSON.stringify({
	ok: true,
	suite: "mission-continuity-policy-advisory",
	ordinaryCompletionAllowed: true,
	resumeSuggested: true,
	explicitStopAllowed: true
}, null, 2));
