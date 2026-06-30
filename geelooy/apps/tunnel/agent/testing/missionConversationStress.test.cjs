// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const M = require('../tools/fs/mission/index.js');

const COUNT = Number(process.env.AWTSMOOS_MISSION_STRESS_COUNT || 250);
const PARALLEL = Number(process.env.AWTSMOOS_MISSION_STRESS_PARALLEL || 25);
const AUTO_ROUNDS = Number(process.env.AWTSMOOS_MISSION_STRESS_AUTO_ROUNDS || 6);

async function cycle(config, index) {
  const mission = await M.create(config, {
    goal: `stress conversation mission ${index}`,
    definitionOfDone: ['verification passed'],
    auto: index % 2 === 0,
    maxCycles: 100
  });
  let next = M.nextStep(mission, { autoAdvance: mission.automation.enabled });
  assert.equal(next.keepGoing, true);
  assert.ok(next.question.choices.length >= 5);

  let answer = 'A';
  for (let round = 0; round < AUTO_ROUNDS; round++) {
    const out = M.answer(mission, { answer });
    assert.ok(out.parsed.key, `round ${round} parsed key`);
    if (round === 1) M.attachJob(mission, { jobId: `job_${index}_${round}`, purpose: 'long stress job', expectedSignal: 'ok', timeoutMs: 7200000 });
    if (round === 2) M.evidence(mission, { claim: 'verification passed', kind: 'stress' });
    const open = mission.tasks.find(t => t.status !== 'done');
    if (round >= 3 && open) M.completeTask(mission, open.id);
    const hb = M.heartbeat(mission, { note: `heartbeat ${round}` });
    assert.ok(hb.at);
    answer = out.next.autoSuggestedAnswer || 'D';
  }

  if (!mission.evidence.length) M.evidence(mission, { claim: 'verification passed', kind: 'fallback' });
  for (const task of mission.tasks.filter(t => t.status !== 'done')) M.completeTask(mission, task.id);
  M.ask(mission, 'E');
  const verified = M.verify(mission);
  assert.equal(verified.ok, true, JSON.stringify(verified));
  const final = M.answer(mission, { answer: 'E' });
  assert.equal(mission.status, 'done');
  assert.equal(final.next.keepGoing, true);
  assert.equal(final.next.finalAnswerAllowed, false);
  await M.save(config, mission);
  const loaded = await M.load(config, mission.id);
  assert.equal(loaded.status, 'done');
  assert.ok(loaded.answers.length >= AUTO_ROUNDS);
  assert.ok(loaded.events.length >= AUTO_ROUNDS);
  return { id: loaded.id, answers: loaded.answers.length, events: loaded.events.length, jobs: loaded.jobs.length, autoCycles: loaded.automation.cycles };
}

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-mission-conversation-stress-'));
  const config = { root, allowWrite: true, allowSecrets: false, tools: { fsWrite: true, fsRead: true, fsBulk: true } };
  const t0 = Date.now();
  const results = [];
  for (let i = 0; i < COUNT; i += PARALLEL) {
    const batch = Array.from({ length: Math.min(PARALLEL, COUNT - i) }, (_, j) => cycle(config, i + j));
    results.push(...await Promise.all(batch));
  }
  const ms = Date.now() - t0;
  const summary = {
    ok: true,
    suite: 'mission-conversation-stress',
    count: COUNT,
    parallel: PARALLEL,
    autoRounds: AUTO_ROUNDS,
    ms,
    perSecond: Number((COUNT / (ms / 1000)).toFixed(2)),
    totalAnswers: results.reduce((s, r) => s + r.answers, 0),
    totalEvents: results.reduce((s, r) => s + r.events, 0),
    totalJobs: results.reduce((s, r) => s + r.jobs, 0),
    sample: results.slice(0, 3)
  };
  console.log(JSON.stringify(summary, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
