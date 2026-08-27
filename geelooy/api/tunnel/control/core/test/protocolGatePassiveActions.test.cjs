// B"H
const assert = require("assert");
const { actionAllowedWhilePending, isPassiveAction } = require("../protocolGatePolicy.js");
const { protocolFor, attachActionGuidance } = require("../actionGuidance.js");

/**
 * B"H
 * Chapter 826: many agents may hold tools while one mission asks a question.
 */
for (const action of ["command", "commandRun", "commandStart", "commandWait", "commandJobOutputPage", "read", "list", "payloadEcho", "actionSchemaTrace", "agentDoctor", "configGet"]) {
  assert.equal(isPassiveAction(action), true, `${action} passive`);
  assert.equal(actionAllowedWhilePending({ action }, { question: "IS THIS MISSION COMPLETE?" }).ok, true, `${action} allowed through stale gate`);
  const protocol = protocolFor({ ok: true, action }, { action });
  assert.equal(protocol.mustContinue, false, `${action} no guidance gate`);
  assert.equal(protocol.responseFocus.mustAnswerGate, false, `${action} focus quiet`);
  const shaped = attachActionGuidance({ ok: true, action }, { action });
  assert.equal(shaped.responseFocus.mustAnswerGate, false, `${action} shaped quiet`);
  assert.equal(Object.prototype.hasOwnProperty.call(shaped, "multipleChoiceSelfInterrogation"), false, `${action} no MC field`);
}
console.log(JSON.stringify({ ok: true, suite: "protocol-gate-passive-actions" }, null, 2));
