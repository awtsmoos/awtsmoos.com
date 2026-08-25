// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Takeover = require("../tools/fs/mission/takeover/index.js");

/**
 * @file Proves a successor inherits unfinished mission testimony instead of only a lock label.
 * @description
 * The Awtsmoos lets one shliach continue the flame of another; Awtsmoos.com requires an
 * explicit successor and preserves predecessor, continuation, remaining work, and next action.
 */
const lock = {
	owner: "agent-alpha",
	missionId: "mission-one",
	mustCallNext: "missionContinueUntilGate",
	continuation: { requestId: "continue-one", requested: true },
	remainingWork: ["verify browser cooldown", "finish release"],
	customEvidence: { immutable: true }
};

assert.equal(Takeover.identity({}), "");
assert.throws(
	() => Takeover.claim(lock, ""),
	error => error.code === "takeover_identity_required"
);
const claimed = Takeover.claim(lock, "agent-beta");
assert.equal(claimed.owner, "agent-beta");
assert.equal(claimed.previousOwner, "agent-alpha");
assert.equal(claimed.takeoverCount, 1);
assert.equal(claimed.mustCallNext, lock.mustCallNext);
assert.deepEqual(claimed.continuation, lock.continuation);
assert.deepEqual(claimed.remainingWork, lock.remainingWork);
assert.deepEqual(claimed.customEvidence, lock.customEvidence);
assert.deepEqual(claimed.takeoverHistory[0], {
	from: "agent-alpha",
	to: "agent-beta",
	at: claimed.takeoverAt
});
assert.equal(Takeover.identity({ logicalAgentId: "logical-successor" }), "logical-successor");
console.log(JSON.stringify({ ok: true, predecessor: claimed.previousOwner, successor: claimed.owner }));
