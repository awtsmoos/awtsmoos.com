// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const M = require('../tools/fs/mission/index.js');

/** B"H — Chapter 1202: The mission test spoke in exact gate letters. */
(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-mission-chat-'));
  const config = { root, allowWrite: true, allowSecrets: false, tools: { fsWrite: true, fsRead: true, fsBulk: true } };
  const mission = await M.create(config, { goal: 'conversation loop mission', definitionOfDone: ['verification passed'] });
  const next = M.nextStep(mission);
  assert.equal(next.keepGoing, true);
  assert.equal(next.question.choices.length, 5);
  const a1 = M.answer(mission, { answer: 'A' });
  assert.equal(a1.parsed.key, 'A');
  assert.equal(mission.tasks.length, 1);
  const a2 = M.answer(mission, { answer: 'D' });
  assert.equal(a2.parsed.key, 'D');
  assert.equal(mission.automation.enabled, true);
  assert.ok(a2.next.autoSuggestedAnswer);
  const a3 = M.answer(mission, { answer: a2.next.autoSuggestedAnswer });
  assert.ok(a3.applied.applied);
  M.evidence(mission, { claim: 'verification passed', kind: 'test' });
  M.completeTask(mission, mission.tasks[0].id);
  M.ask(mission, 'E');
  const hb = M.heartbeat(mission, { note: 'still alive' });
  assert.equal(hb.keepGoing, true);
  assert.equal(M.verify(mission).ok, true);
  const final = M.answer(mission, { answer: 'E' });
  assert.equal(mission.status, 'done');
  assert.equal(final.next.keepGoing, true);
  assert.equal(final.next.finalAnswerAllowed, false);
  await M.save(config, mission);
  const loaded = await M.load(config, mission.id);
  assert.equal(loaded.status, 'done');
  assert.ok(loaded.answers.length >= 3);
  console.log(JSON.stringify({ ok: true, suite: 'mission-conversation-loop', missionId: mission.id, answers: loaded.answers.length, autoCycles: loaded.automation.cycles, status: loaded.status }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
