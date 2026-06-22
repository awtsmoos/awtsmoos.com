// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { buildActions } = require('../tools/fs/actions.js');
(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-mission-actions-'));
  const config = { root, allowWrite: true, allowSecrets: false, tools: { fsWrite: true, fsRead: true, fsBulk: true } };
  let actions = buildActions(config, { action: 'missionStart', goal: 'registry mission', definitionOfDone: ['verification passed'] }, null);
  const started = await actions.missionStart();
  assert.equal(started.ok, true);
  const missionId = started.missionId;
  actions = buildActions(config, { action: 'missionAddTask', missionId, title: 'wire registry' }, null);
  const task = await actions.missionAddTask();
  actions = buildActions(config, { action: 'missionEvidence', missionId, claim: 'verification passed', kind: 'test' }, null);
  const evidence = await actions.missionEvidence();
  actions = buildActions(config, { action: 'missionCompleteTask', missionId, taskId: task.task.id, evidenceId: evidence.evidence.id }, null);
  await actions.missionCompleteTask();
  actions = buildActions(config, { action: 'missionQuestion', missionId, answer: 'D none' }, null);
  await actions.missionQuestion();
  actions = buildActions(config, { action: 'missionVerify', missionId }, null);
  const verified = await actions.missionVerify();
  assert.equal(verified.verification.ok, true);
  console.log(JSON.stringify({ ok: true, missionId, checks: ['registry','start','task','evidence','question','verify'] }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
