// B"H
const assert = require("assert");
const { protocolFor, attachActionGuidance, isPassiveAction } = require("../actionGuidance.js");

/**
 * B"H
 * Chapter 823: The hammer is not a mission room. Passive tools must not arm the
 * forced multiple-choice gate, or the next command can inherit ghost-state from
 * an unrelated action and return as configGet, list, read, or finishAndContinue.
 */
for (const action of ["read", "bulk", "commandStart", "commandStatus", "commandWait", "commandJobOutputPage", "configGet"]) {
  assert.equal(isPassiveAction(action), true, `${action} should be passive`);
  const protocol = protocolFor({ ok: true, action }, { action });
  assert.equal(protocol.mustContinue, false, `${action} should not force continuation`);
  assert.equal(protocol.responseFocus.mustAnswerGate, false, `${action} should not arm answer gate`);
  assert.equal(protocol.multipleChoiceSelfInterrogation, null, `${action} should not emit multiple choice`);
  const shaped = attachActionGuidance({ ok: true, action }, { action });
  assert.equal(shaped.mustContinue, false, `${action} shaped result should be final for transport`);
  assert.equal(Object.prototype.hasOwnProperty.call(shaped, "multipleChoiceSelfInterrogation"), false, `${action} should not include stale MC field`);
}

const mission = protocolFor({ ok: true, action: "missionNext", missionId: "m1" }, { action: "missionNext", missionId: "m1" });
assert.equal(mission.mustContinue, true, "mission action should still force continuation");
assert.equal(mission.responseFocus.mustAnswerGate, true, "mission action should still expose the gate");
console.log(JSON.stringify({ ok: true, suite: "action-guidance-passive-actions" }, null, 2));
