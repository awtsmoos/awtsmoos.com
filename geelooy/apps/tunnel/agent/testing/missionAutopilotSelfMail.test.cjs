// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const M = require('../tools/fs/mission/index.js');

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-mission-autopilot-'));
  const config = { root, allowWrite: true, allowSecrets: false, tools: { fsWrite: true, fsRead: true, fsBulk: true } };
  const mission = await M.create(config, {
    goal: 'never stop until mission is actually complete',
    definitionOfDone: ['verification passed', 'stress coverage'],
    auto: true,
    selfMail: true,
    maxAutopilotRounds: 25,
    maxSelfBrainstormCycles: 8,
    mailEveryRounds: 2
  });

  const first = M.autopilot(mission, { rounds: 6, selfEmail: 'agent@example.test' });
  assert.equal(first.askHuman, false);
  assert.ok(first.rounds.length >= 4);
  assert.ok(['mission_not_continuing', 'round_limit'].includes(first.stopped));
  assert.ok(mission.questions.length >= 4);
  assert.ok(mission.answers.length >= 4);
  assert.ok(mission.brainstorms.length >= 4);
  assert.ok(mission.checkpoints.length >= 2);
  assert.ok(mission.mail.length >= 2);
  assert.ok(mission.mail.every(mail => mail.status === 'ready_to_send'));

  M.evidence(mission, { claim: 'verification passed stress coverage', kind: 'test' });
  for (const task of mission.tasks.filter(t => t.status !== 'done')) M.completeTask(mission, task.id);
  M.ask(mission, 'E final court');
  const final = M.answer(mission, { answer: 'E mark done only if gates pass' });
  assert.equal(mission.status, 'done');
  assert.equal(final.next.keepGoing, true);
  assert.equal(final.next.finalAnswerAllowed, false);
  assert.equal(final.next.report.continuation.reason, 'minimum_innovation_window_not_satisfied');

  await M.save(config, mission);
  const loaded = await M.load(config, mission.id);
  assert.equal(loaded.status, 'done');
  assert.ok(loaded.mail.length >= 2);
  assert.ok(loaded.checkpoints.length >= 2);
  console.log(JSON.stringify({ ok: true, suite: 'mission-autopilot-self-mail', missionId: mission.id, rounds: first.rounds.length, mail: loaded.mail.length, checkpoints: loaded.checkpoints.length }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
