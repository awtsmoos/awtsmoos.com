// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';

const require = createRequire(import.meta.url);
const { buildMissionActions } = require('../missionActions.js');

async function action(config, name, payload) {
  const actions = buildMissionActions({ config, payload: { action: name, ...payload } });
  const result = await actions[name]();
  assert.equal(result.action, name, `${name} should echo its action`);
  assert.equal(result.ok, true, `${name} should succeed`);
  return result;
}

async function startMission(config, goal = 'mission answer parser regression') {
  return action(config, 'missionStart', {
    params: JSON.stringify({ goal, definitionOfDone: ['parser verified'], expand: false, minimumInnovationWindowMs: 0 })
  });
}

async function report(config, missionId) {
  return action(config, 'missionReport', { params: JSON.stringify({ missionId }) });
}

function params(value) {
  return { params: JSON.stringify(value) };
}

async function assertAnswerShape(config, label, buildPayload, expectedKey = 'A') {
  const start = await startMission(config, `mission answer parser shape ${label}`);
  const missionId = start.missionId;
  const payload = buildPayload(missionId, start);
  const answered = await action(config, 'missionAnswer', payload);
  assert.equal(answered.parsed.key, expectedKey, `${label} should parse ${expectedKey}`);
  assert.equal(answered.parsed.choice?.key, expectedKey, `${label} should resolve choice ${expectedKey}`);
  assert.equal(answered.applied.applied, true, `${label} should apply`);
  assert.ok(answered.applied.task, `${label} should create a task`);
  assert.equal(answered.mission.counts.answers, 1, `${label} should record one valid answer`);
  assert.equal(answered.mission.counts.totalTasks, 1, `${label} should create one task`);
}

async function assertMissionAnswerParserShapes(config) {
  await assertAnswerShape(config, 'top-level answer', missionId => ({ missionId, answer: 'A' }));
  await assertAnswerShape(config, 'top-level choice', missionId => ({ missionId, choice: 'A' }));
  await assertAnswerShape(config, 'top-level multipleChoiceAnswer', missionId => ({ missionId, multipleChoiceAnswer: 'A' }));
  await assertAnswerShape(config, 'params answer', missionId => params({ missionId, answer: 'A' }));
  await assertAnswerShape(config, 'params choice', missionId => params({ missionId, choice: 'A' }));
  await assertAnswerShape(config, 'params multipleChoiceAnswer', missionId => params({ missionId, multipleChoiceAnswer: 'A' }));
  await assertAnswerShape(config, 'missionId params answer top-level', missionId => ({ params: JSON.stringify({ missionId }), answer: 'A' }));
  await assertAnswerShape(config, 'missionId top-level answer params', missionId => ({ missionId, params: JSON.stringify({ answer: 'A' }) }));
  await assertAnswerShape(config, 'exact B', missionId => ({ missionId, answer: 'B' }), 'B');
}


async function assertStrictProseRejected(config) {
  const start = await startMission(config, 'strict prose rejection');
  const missionId = start.missionId;
  const invalid = await action(config, 'missionAnswer', { missionId, multipleChoiceAnswer: 'A create the first concrete task' });
  assert.equal(invalid.parsed.key, '', 'strict prose must not produce a key');
  assert.equal(invalid.parsed.choice, null, 'strict prose must not resolve a choice');
  assert.equal(invalid.applied.applied, false, 'strict prose must not apply');
  assert.equal(invalid.applied.error, 'answer_must_be_one_exact_letter');
  assert.equal(invalid.mission.counts.answers, 0, 'strict prose must not record an answer');
  assert.equal(invalid.mission.counts.totalTasks, 0, 'strict prose must not mutate tasks');
}

async function assertDefaultInnovationWindowBlocksCompletion(config) {
  const start = await action(config, 'missionStart', {
    params: JSON.stringify({ goal: 'default innovation window blocks exit', definitionOfDone: ['window proof'], expand: false })
  });
  const missionId = start.missionId;
  const task = await action(config, 'missionAddTask', { params: JSON.stringify({ missionId, title: 'prove window' }) });
  const ev = await action(config, 'missionEvidence', { params: JSON.stringify({ missionId, claim: 'window proof', kind: 'test', proof: 'observed' }) });
  await action(config, 'missionCompleteTask', { params: JSON.stringify({ missionId, taskId: task.task.id, evidenceId: ev.evidence.id, expand: false }) });
  await action(config, 'missionQuestion', { params: JSON.stringify({ missionId, answer: 'E' }) });
  const court = await action(config, 'missionCourt', { params: JSON.stringify({ missionId, minConfidence: 40 }) });
  assert.equal(court.court.ok, false, 'default one-hour innovation window should block court approval');
  assert.equal(court.court.finalAnswerAllowed, false);
  assert(court.court.issues.includes('minimum_innovation_window'));
  assert.equal(court.court.innovation.minimumWorkWindowMs, 60 * 60 * 1000);
}

async function assertMustCallNextRoundTrip(config) {
  const start = await startMission(config, 'mustCallNext mission answer round trip');
  const nextCall = start.next.mustCallNext;
  assert.equal(nextCall.action, 'missionAnswer');
  const answered = await action(config, nextCall.action, nextCall);
  assert.equal(answered.parsed.key, 'A');
  assert.equal(answered.applied.applied, true);
  assert.equal(answered.mission.counts.totalTasks, 1);
  assert.equal(answered.next.keepGoing, true);
}


async function assertQuestionIdAndIdempotency(config) {
  const start = await startMission(config, 'question identity and idempotency');
  const firstCall = start.next.mustCallNext;
  assert.equal(firstCall.multipleChoiceAnswer, 'A');
  assert.ok(firstCall.questionId, 'mustCallNext should carry questionId');
  assert.ok(firstCall.idempotencyKey, 'mustCallNext should carry idempotencyKey');

  const first = await action(config, 'missionAnswer', firstCall);
  assert.equal(first.applied.applied, true);
  assert.equal(first.mission.counts.answers, 1);
  assert.equal(first.mission.counts.totalTasks, 1);

  const duplicate = await action(config, 'missionAnswer', firstCall);
  assert.equal(duplicate.applied.duplicate, true, 'same call should be idempotent duplicate');
  assert.equal(duplicate.mission.counts.answers, 1, 'duplicate must not record a second answer');
  assert.equal(duplicate.mission.counts.totalTasks, 1, 'duplicate must not create a second task');

  const staleDifferent = await action(config, 'missionAnswer', {
    ...firstCall,
    multipleChoiceAnswer: 'B',
    idempotencyKey: 'manual-different-key-same-question'
  });
  assert.equal(staleDifferent.applied.duplicate, true, 'same question with different key should still be rejected as duplicate');
  assert.equal(staleDifferent.mission.counts.answers, 1);
  assert.equal(staleDifferent.mission.counts.totalTasks, 1);
}

async function assertFuzzGarbageNeverMutates(config) {
  const garbage = ['', ' ', 'AA', 'A.', 'A create', 'I choose A', 'banana', '1', '{"multipleChoiceAnswer":"A"}', 'אבג', '🚀'];
  for (const value of garbage) {
    const start = await startMission(config, `garbage answer ${JSON.stringify(value)}`);
    const invalid = await action(config, 'missionAnswer', {
      missionId: start.missionId,
      questionId: start.next.mustCallNext.questionId,
      multipleChoiceAnswer: value
    });
    assert.equal(invalid.applied.applied, false, `garbage ${JSON.stringify(value)} must not apply`);
    assert.equal(invalid.mission.counts.answers, 0, `garbage ${JSON.stringify(value)} must not record`);
    assert.equal(invalid.mission.counts.totalTasks, 0, `garbage ${JSON.stringify(value)} must not mutate tasks`);
  }
}

async function assertInvalidAnswerDoesNotMutateAnswers(config) {
  const start = await startMission(config, 'invalid answer state mutation regression');
  const missionId = start.missionId;
  const invalid = await action(config, 'missionAnswer', { missionId, answer: 'not a valid gate choice' });
  assert.equal(invalid.parsed.choice, null);
  assert.equal(invalid.applied.applied, false);
  assert.equal(invalid.mission.counts.answers, 0, 'invalid answer must not increment answers');
  assert.equal(invalid.mission.counts.totalTasks, 0, 'invalid answer must not apply side effects');
  const after = await report(config, missionId);
  assert.equal(after.report.counts.answers, 0, 'report must not show invalid answer as answered');
}

async function makeCompletedMission(config) {
  const start = await action(config, 'missionStart', {
    params: JSON.stringify({
      goal: 'YAML live continuity action test',
      definitionOfDone: ['continuity actions verified'],
      expand: false,
      minimumInnovationWindowMs: 0,
      projectRoot: '/repo/root'
    })
  });
  const missionId = start.missionId;
  assert.equal(start.mission.goal, 'YAML live continuity action test');
  assert.equal(start.mission.continuation.dod.checks[0].name, 'continuity actions verified');

  const firstCourt = await action(config, 'missionCourt', { params: JSON.stringify({ missionId }) });
  assert.equal(firstCourt.court.ok, false);
  assert.equal(firstCourt.court.finalAnswerAllowed, false);
  assert.equal(firstCourt.court.mustContinue, true);
  assert.equal(firstCourt.court.responseFocus.mustAnswerGate, true);
  assert.ok(firstCourt.court.issues.includes('no_evidence'));

  const continuity = await action(config, 'missionContinuity', { params: JSON.stringify({ missionId }) });
  assert.equal(continuity.heartbeat.recovery.missionId, missionId);
  assert.ok(continuity.heartbeat.verdict);

  const task = await action(config, 'missionAddTask', {
    params: JSON.stringify({ missionId, title: 'verify continuity actions through live GPT schema' })
  });
  const evidence = await action(config, 'missionEvidence', {
    params: JSON.stringify({
      missionId,
      claim: 'continuity actions verified',
      kind: 'test',
      details: 'Observed missionCourt, missionContinuity, missionSpawnNext, and missionRecovery through the action schema.'
    })
  });
  assert.equal(evidence.evidence.kind, 'test');
  assert.equal(evidence.evidence.proof.includes('Observed missionCourt'), true);

  await action(config, 'missionCompleteTask', {
    params: JSON.stringify({ missionId, taskId: task.task.id, evidenceId: evidence.evidence.id })
  });
  await action(config, 'missionQuestion', {
    params: JSON.stringify({ missionId, answer: 'E' })
  });
  await action(config, 'missionAnswer', {
    params: JSON.stringify({ missionId, answer: 'E' })
  });
  return missionId;
}

async function assertCompletionGates(config, missionId) {
  const verify = await action(config, 'missionVerify', { params: JSON.stringify({ missionId, expand: false }) });
  assert.equal(verify.verification.ok, true);
  assert.equal(verify.after, null);

  const finalCourt = await action(config, 'missionCourt', {
    params: JSON.stringify({ missionId, minConfidence: 40 })
  });
  assert.equal(finalCourt.court.ok, true);
  assert.equal(finalCourt.court.finalAnswerAllowed, true);
  assert.equal(finalCourt.court.mustContinue, false);
  assert.deepEqual(finalCourt.court.evidenceDebt, []);

  const recovery = await action(config, 'missionRecovery', { params: JSON.stringify({ missionId }) });
  assert.equal(recovery.recovery.missionId, missionId);
  assert.ok(Array.isArray(recovery.recovery.unfinishedTasks));
  assert.ok(Array.isArray(recovery.recovery.openJobs));
  assert.ok(Array.isArray(recovery.recovery.openUserMessages));

  const spawn = await action(config, 'missionSpawnNext', { params: JSON.stringify({ missionId }) });
  assert.ok(Array.isArray(spawn.spawned));
  assert.equal(spawn.spawned.length, 0, 'approved mission should not spawn debt missions');
}

async function assertBlockingPath(config, missionId) {
  const room = await action(config, 'missionRoomUserMessage', {
    params: JSON.stringify({
      missionId,
      message: 'Blocking behavior test: please require agent response before continuing.',
      blockOnUserMessage: true
    })
  });
  const userMessageId = room.userMessage.id;
  assert.equal(room.userMessage.requiresResponse, true);
  assert.equal(room.userMessage.status, 'open');
  assert.equal(room.finalAnswerAllowed, false);
  assert.equal(room.mustContinue, true);
  assert.equal(room.responseFocus.mustAnswerGate, true);

  const sync = await action(config, 'missionAgentSync', {
    params: JSON.stringify({ missionId, blockOnUserMessage: true })
  });
  assert.equal(sync.mustCallNext.action, 'missionAgentRespond');
  assert.equal(sync.finalAnswerAllowed, false);
  assert.equal(sync.mustContinue, true);
  assert.equal(sync.responseFocus.mustAnswerGate, true);

  const response = await action(config, 'missionAgentRespond', {
    params: JSON.stringify({
      missionId,
      agentId: 'agent',
      userMessageId,
      body: 'Responding with proof and continue.'
    })
  });
  assert.equal(response.userMessage.status, 'continue');
  assert.deepEqual(response.collaboration.openUserMessages, []);
}

async function assertLeaseAndConstitution(config, missionId) {
  const lease = await action(config, 'missionLease', { params: JSON.stringify({ missionId }) });
  assert.equal(lease.lease.lease.defaultLeaseMs, 60 * 60 * 1000);
  assert.equal(typeof lease.lease.remainingMs, 'number');

  const renewed = await action(config, 'missionLeaseRenew', {
    params: JSON.stringify({ missionId, leaseMinutes: 30, reason: 'regression renewal' })
  });
  assert.equal(renewed.lease.lease.defaultLeaseMs, 30 * 60 * 1000);
  assert.equal(renewed.lease.lease.renewals > 0, true);

  const entropy = await action(config, 'missionEntropy', { params: JSON.stringify({ missionId }) });
  assert.equal(typeof entropy.entropy.score, 'number');

  const constitution = await action(config, 'missionConstitution', { params: JSON.stringify({ missionId }) });
  assert.ok(Array.isArray(constitution.constitution.checks));
  assert.ok(Array.isArray(constitution.constitution.missing));

  const enforcedCourt = await action(config, 'missionCourt', {
    params: JSON.stringify({ missionId, enforceConstitution: true, minConfidence: 40 })
  });
  assert.equal(enforcedCourt.court.constitutionEnforced, true);
  assert.equal(enforcedCourt.court.finalAnswerAllowed, enforcedCourt.court.ok);
}

async function assertDebtSpawns(config) {
  const start = await action(config, 'missionStart', {
    params: JSON.stringify({ goal: 'Debt spawn regression mission', definitionOfDone: ['proof exists'], expand: false, minimumInnovationWindowMs: 0 })
  });
  const spawned = await action(config, 'missionSpawnNext', {
    params: JSON.stringify({ missionId: start.missionId })
  });
  assert.ok(Array.isArray(spawned.spawned));
  assert.ok(spawned.spawned.length > 0, 'debt mission should spawn follow-up missions');
  assert.equal(spawned.verdict.finalAnswerAllowed, false);
}

async function main() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-mission-actions-'));
  const config = { root };
  await assertMissionAnswerParserShapes(config);
  await assertStrictProseRejected(config);
  await assertMustCallNextRoundTrip(config);
  await assertDefaultInnovationWindowBlocksCompletion(config);
  await assertQuestionIdAndIdempotency(config);
  await assertFuzzGarbageNeverMutates(config);
  await assertInvalidAnswerDoesNotMutateAnswers(config);
  const missionId = await makeCompletedMission(config);
  await assertCompletionGates(config, missionId);
  await assertLeaseAndConstitution(config, missionId);
  await assertBlockingPath(config, missionId);
  await assertDebtSpawns(config);
  console.log(JSON.stringify({ ok: true, missionId, root }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
