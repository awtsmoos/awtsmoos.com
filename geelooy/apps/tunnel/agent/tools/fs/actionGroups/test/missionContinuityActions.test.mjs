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

async function makeCompletedMission(config) {
  const start = await action(config, 'missionStart', {
    params: JSON.stringify({
      goal: 'YAML live continuity action test',
      definitionOfDone: ['continuity actions verified'],
      expand: false,
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
    params: JSON.stringify({ missionId, answer: 'E mark done only if gates pass' })
  });
  await action(config, 'missionAnswer', {
    params: JSON.stringify({ missionId, answer: 'E mark done only if gates pass' })
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
    params: JSON.stringify({ goal: 'Debt spawn regression mission', definitionOfDone: ['proof exists'], expand: false })
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
