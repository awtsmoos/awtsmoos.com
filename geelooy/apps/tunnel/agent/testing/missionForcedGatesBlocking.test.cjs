// B"H
const assert = require("assert");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const { buildActions } = require("../tools/fs/actions.js");

function action(config, payload) {
  return buildActions(config, payload, null)[payload.action]();
}
function assertGate(next, label) {
  assert(next, label + " missing next");
  assert.equal(next.finalAnswerAllowed, false, label + " final answer must be blocked");
  assert.equal(next.mustContinue, true, label + " must continue");
  assert(next.mustCallNext, label + " mustCallNext missing");
  assert(next.responseFocus?.mustAnswerGate, label + " responseFocus gate missing");
  assert(next.multipleChoiceSelfInterrogation, label + " multiple-choice missing");
}

/**
 * B"H
 * Chapter 540: The mission court locks every lazy exit.
 * This test proves the agent is forced through A-E gates, room blocking, answer
 * responses, pure verification, and opt-in improvement mode. No silent final
 * answer, no wandering away from the plan, no pretending that open user speech
 * has been handled.
 */
(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awts-mission-gates-"));
  const config = { root, allowWrite: true, allowCommands: true, tools: { fsRead: true, fsWrite: true, fsBulk: true, command: true } };

  const started = await action(config, {
    action: "missionStart",
    goal: "forced gates and blocking",
    definitionOfDone: ["gate proof passed"],
    minimumInnovationWindowMs: 0,
    expand: false
  });
  assert.equal(started.ok, true);
  assertGate(started.next, "missionStart");
  const missionId = started.missionId;

  const answerA = await action(config, { action: "missionAnswer", missionId, answer: "A" });
  assert.equal(answerA.ok, true);
  assert(answerA.applied.task, "answer A should create a task");
  assertGate(answerA.next, "answerA next");

  const evidence = await action(config, { action: "missionEvidence", missionId, claim: "gate proof passed", kind: "test" });
  assert.equal(evidence.ok, true);
  assertGate(evidence.next, "evidence next");

  const taskId = answerA.applied.task.id;
  const completed = await action(config, { action: "missionCompleteTask", missionId, taskId, evidenceId: evidence.evidence.id, expand: false });
  assert.equal(completed.ok, true);
  assert.equal(completed.expansion, null);
  assertGate(completed.next, "complete next");

  const question = await action(config, { action: "missionQuestion", missionId, answer: "E" });
  assert.equal(question.ok, true);
  assertGate(question.next, "question next");

  const pure = await action(config, { action: "missionVerify", missionId, expand: false });
  assert.equal(pure.ok, true);
  assert.equal(pure.verification.ok, true);
  assert.equal(pure.after, null, "expand:false must not open improvement mode");

  const improved = await action(config, { action: "missionVerify", missionId, expand: true });
  assert.equal(improved.verification.ok, true);
  assert(improved.after, "expand:true should enter post-completion improvement mode");

  const joined = await action(config, { action: "missionProjectJoin", missionId, agentId: "alpha", projectRoot: root });
  assert.equal(joined.ok, true);
  assert.equal(joined.finalAnswerAllowed, false);
  assert.equal(joined.responseFocus.mustAnswerGate, true);

  const settings = await action(config, { action: "missionRoomSettings", missionId, blockOnUserMessage: true });
  assert.equal(settings.settings.blockOnUserMessage, true);

  const user = await action(config, { action: "missionRoomUserMessage", missionId, message: "Please pause and answer this blocking note.", blockOnUserMessage: true });
  assert.equal(user.userMessage.status, "open");
  assert.equal(user.userMessage.requiresResponse, true);
  assert.equal(user.mustCallNext.action, "missionAgentSync");
  assert(user.multipleChoiceSelfInterrogation, "blocking user message must immediately expose multiple choice gate");
  assert.equal(user.responseFocus.mustAnswerGate, true);

  const syncBlocked = await action(config, { action: "missionAgentSync", missionId, agentId: "alpha", blockOnUserMessage: true });
  assert.equal(syncBlocked.mustCallNext.action, "missionAgentRespond");
  assert(syncBlocked.blockingUserMessages.length === 1);
  assert.equal(syncBlocked.responseFocus.mustAnswerGate, true);
  assert(syncBlocked.multipleChoiceSelfInterrogation, "blocking sync must expose multiple choice gate");

  const responded = await action(config, { action: "missionAgentRespond", missionId, agentId: "alpha", userMessageId: user.userMessage.id, message: "Answered with proof; continue." });
  assert.equal(responded.userMessage.status, "continue");
  assert.equal(responded.collaboration.openUserMessages.length, 0);

  const continueMsg = await action(config, { action: "missionRoomUserMessage", missionId, message: "continue with proof", blockOnUserMessage: true });
  assert.equal(continueMsg.userMessage.allowContinue, true);
  assert.equal(continueMsg.userMessage.requiresResponse, false);
  const syncClear = await action(config, { action: "missionAgentSync", missionId, agentId: "alpha", blockOnUserMessage: true });
  assert(!syncClear.blockingUserMessages, "allow-continue message must not block sync");
  assert.equal(syncClear.mustCallNext.action, "missionAgentSync");

  console.log(JSON.stringify({ ok: true, suite: "mission-forced-gates-blocking", missionId, checks: ["multiple-choice-gates", "auto-answer-next", "blocking-sync", "agent-respond", "allow-continue", "pure-verify", "improvement-opt-in"] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
