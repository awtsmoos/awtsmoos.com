// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const M = require('../tools/fs/mission/index.js');

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

/**
 * B"H
 * Chapter 520: The mission slept, woke, remembered, and continued.
 * This proves the vessel is not merely fast CRUD: state survives delay, reload,
 * staged evidence, and a final verification court after asynchronous waiting.
 */
(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-mission-long-'));
  const config = { root, allowWrite: true, allowSecrets: false, tools: { fsWrite: true, fsRead: true, fsBulk: true } };
  const mission = await M.create(config, { goal: 'long-run persistent mission', definitionOfDone: ['verification passed'] });
  const task = M.addTask(mission, 'long task');
  await M.save(config, mission);
  await sleep(Number(process.env.AWTSMOOS_LONG_MISSION_DELAY_MS || 2500));
  const reloaded = await M.load(config, mission.id);
  assert.equal(reloaded.id, mission.id);
  assert.equal(M.verify(reloaded).ok, false);
  const ev = M.evidence(reloaded, { kind: 'long-run-test', claim: 'verification passed', proof: { waited: true } });
  M.completeTask(reloaded, task.id, ev.id);
  M.ask(reloaded, 'D none');
  M.discover(reloaded);
  await M.save(config, reloaded);
  await sleep(Number(process.env.AWTSMOOS_LONG_MISSION_SECOND_DELAY_MS || 2500));
  const finalMission = await M.load(config, mission.id);
  assert.equal(M.verify(finalMission).ok, true);
  finalMission.status = 'done';
  assert.equal(M.supervise(finalMission).verdict, 'stop');
  console.log(JSON.stringify({ ok: true, suite: 'mission-long-run-persistence', missionId: finalMission.id, events: finalMission.events.length, evidence: finalMission.evidence.length, questions: finalMission.questions.length }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
