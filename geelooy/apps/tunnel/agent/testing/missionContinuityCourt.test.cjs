// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { buildActions } = require('../tools/fs/actions.js');

function call(config, payload) { return buildActions(config, payload, null)[payload.action](); }

/**
 * B"H
 * Chapter 542: The hour-long agent receives a court, a heartbeat, and a leash.
 * This test refuses premature completion, proves debt creates next actions,
 * proves blocking wins over unrelated work, proves confidence gates completion,
 * and proves new missions are proposed only from evidence-backed debt.
 */
(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-continuity-'));
  const config = { root, allowWrite: true, allowCommands: true, tools: { fsRead: true, fsWrite: true, fsBulk: true, command: true } };
  const start = await call(config, { action: 'missionStart', goal: 'continuity court', definitionOfDone: ['court passed'], expand: false });
  const missionId = start.missionId;

  let court = await call(config, { action: 'missionCourt', missionId });
  assert.equal(court.court.ok, false);
  assert.equal(court.court.finalAnswerAllowed, false);
  assert.equal(court.court.mustContinue, true);
  assert(court.court.issues.includes('evidence_debt'));
  assert(court.court.mustCallNext.action);

  const task = await call(config, { action: 'missionAddTask', missionId, title: 'finish continuity court' });
  const ev = await call(config, { action: 'missionEvidence', missionId, claim: 'court passed', kind: 'test', proof: 'observed test proof' });
  await call(config, { action: 'missionCompleteTask', missionId, taskId: task.task.id, evidenceId: ev.evidence.id, expand: false });
  await call(config, { action: 'missionQuestion', missionId, answer: 'E mark done only if gates pass' });

  court = await call(config, { action: 'missionCourt', missionId, minConfidence: 40 });
  assert.equal(court.court.ok, true);
  assert.equal(court.court.finalAnswerAllowed, true);
  assert.equal(court.court.mustContinue, false);

  const hb = await call(config, { action: 'missionContinuity', missionId, minConfidence: 40 });
  assert.equal(hb.heartbeat.verdict.ok, true);
  assert(hb.heartbeat.recovery.missionId === missionId);

  await call(config, { action: 'missionRoomUserMessage', missionId, message: 'pause for blocking proof', blockOnUserMessage: true });
  const blocked = await call(config, { action: 'missionCourt', missionId, minConfidence: 40 });
  assert.equal(blocked.court.ok, false);
  assert(blocked.court.issues.includes('blocking_user_message'));
  assert.equal(blocked.court.mustCallNext.action, 'missionAgentSync');

  const spawned = await call(config, { action: 'missionSpawnNext', missionId, minConfidence: 99, limit: 3 });
  assert.equal(spawned.ok, true);
  assert(spawned.verdict.issues.includes('blocking_user_message') || spawned.verdict.issues.includes('low_confidence'));

  console.log(JSON.stringify({ ok: true, suite: 'mission-continuity-court', missionId, checks: ['court-denies-early', 'evidence-confidence', 'heartbeat-recovery', 'blocking-wins', 'adaptive-spawn'] }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
