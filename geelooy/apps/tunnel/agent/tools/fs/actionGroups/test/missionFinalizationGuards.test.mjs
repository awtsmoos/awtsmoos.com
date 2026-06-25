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
  assert.equal(result.ok, true, `${name} transport should succeed`);
  return result;
}
function params(value) { return { params: JSON.stringify(value) }; }
async function start(config) {
  return action(config, 'missionStart', params({
    goal: 'finalization guard regression',
    definitionOfDone: ['final proof'],
    minimumInnovationWindowMs: 0,
    minimumProductiveCycles: 1,
    minimumProductiveMs: 100,
    expand: false
  }));
}
async function makeVerifiable(config, missionId) {
  const task = await action(config, 'missionAddTask', params({ missionId, title: 'prove finalization guard' }));
  const evidence = await action(config, 'missionEvidence', params({ missionId, claim: 'final proof', kind: 'test', proof: 'observed finalization guard test' }));
  await action(config, 'missionCompleteTask', params({ missionId, taskId: task.task.id, evidenceId: evidence.evidence.id, expand: false }));
  await action(config, 'missionQuestion', params({ missionId, answer: 'E' }));
}
async function clearRequiredQueue(config, missionId) {
  let status = await action(config, 'missionQueueStatus', params({ missionId }));
  assert(status.queue.requiredOpen > 0, 'queue should seed required continuation debt');
  for (const item of status.queue.items.filter(x => x.required && x.status !== 'done')) {
    await action(config, 'missionQueueComplete', params({ missionId, queueId: item.id, proof: `completed ${item.id}` }));
  }
  status = await action(config, 'missionQueueStatus', params({ missionId }));
  assert.equal(status.queue.requiredOpen, 0, 'required queue should be clear');
}
async function addCycle(config, missionId) {
  const cycle = await action(config, 'missionCycle', params({
    missionId,
    inspection: 'inspected finalization blockers',
    plan: 'clear queue and verify finalize behavior',
    implemented: ['finalization guard test'],
    verification: 'node missionFinalizationGuards.test.mjs passes',
    selfCritique: 'finalization must remain separate from reporting',
    nextIdeas: ['add UI final answer interceptor', 'add more hostile court tests'],
    productiveMs: 100,
    family: 'finalization'
  }));
  assert.equal(cycle.cycle.complete, true);
}
async function main() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-finalize-'));
  const config = { root };
  const started = await start(config);
  const missionId = started.missionId;

  const report = await action(config, 'missionReport', params({ missionId }));
  assert.equal(report.reportIsFinal, false, 'missionReport must never be final');
  assert.equal(report.finalizationAction, 'missionFinalize');

  const early = await action(config, 'missionFinalize', params({ missionId, finalizationReason: 'trying too soon' }));
  assert.equal(early.finalizationAttempt.finalized, false);
  assert.equal(early.finalizationAttempt.error, 'final_answer_blocked');
  assert.equal(early.finalAnswerAllowed, false);
  assert.equal(early.mustContinue, true);
  assert.ok(early.mustCallNext, 'blocked finalize must give a next action');

  await makeVerifiable(config, missionId);
  await clearRequiredQueue(config, missionId);
  await addCycle(config, missionId);

  const final = await action(config, 'missionFinalize', params({ missionId, finalizationReason: 'minimum_window_completed_and_debt_clear' }));
  assert.equal(final.finalizationAttempt.finalized, true);
  assert.equal(final.finalAnswerAllowed, true);
  assert.equal(final.mustContinue, false);
  assert.equal(final.finalizationAttempt.verdict.ok, true);

  const after = await action(config, 'missionReport', params({ missionId }));
  assert.equal(after.report.status, 'done');
  assert.equal(after.report.counts.evidence, 1);
  console.log(JSON.stringify({ ok: true, missionId, root }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
