// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const M = require('../tools/fs/mission/index.js');
(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-mission-'));
  const config = { root, tools: { fsWrite: true, fsRead: true, fsBulk: true }, allowWrite: true, allowSecrets: false };
  const mission = await M.create(config, { goal: 'finish everything', definitionOfDone: ['verification passed'] });
  const task = M.addTask(mission, 'implement');
  const ev = M.evidence(mission, { kind: 'test', claim: 'verification passed', proof: { ok: true } });
  M.completeTask(mission, task.id, ev.id);
  M.ask(mission, 'D none');
  M.discover(mission);
  await M.save(config, mission);
  const loaded = await M.load(config, mission.id);
  assert.equal(loaded.id, mission.id);
  assert.equal(M.verify(loaded).ok, true);
  assert.equal(M.supervise(loaded).verdict, 'continue');
  loaded.status = 'done';
  assert.equal(M.supervise(loaded).verdict, 'stop');
  assert.ok(M.timeline(loaded).length >= 4);
  assert.ok(M.graph(loaded).nodes.length >= 3);
  console.log(JSON.stringify({ ok: true, missionId: loaded.id, checks: ['create','task','evidence','question','discover','verify','supervise'] }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
