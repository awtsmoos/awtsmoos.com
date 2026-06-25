// B"H
const assert = require('assert');
const http = require('http');
const port = Number(process.env.AWTSMOOS_SHADOW_PORT || 3977);
const total = Number(process.env.AWTSMOOS_SHADOW_STRESS_N || 24);

function post(path, body) {
  const data = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path, method: 'POST', headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) } }, res => {
      let text = '';
      res.on('data', c => text += c);
      res.on('end', () => {
        try { resolve(JSON.parse(text)); }
        catch (error) { reject(new Error('bad json: ' + text.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function missionCycle(index) {
  const start = await post('/fs', { action: 'missionStart', goal: `stress ${index}`, definitionOfDone: ['verification passed'] });
  assert.equal(start.ok, true);
  const missionId = start.missionId;
  const task = await post('/fs', { action: 'missionAddTask', missionId, title: `task ${index}` });
  assert.equal(task.ok, true);
  const ev = await post('/fs', { action: 'missionEvidence', missionId, claim: 'verification passed', kind: 'stress' });
  assert.equal(ev.ok, true);
  const done = await post('/fs', { action: 'missionCompleteTask', missionId, taskId: task.task.id, evidenceId: ev.evidence.id });
  assert.equal(done.task.status, 'done');
  const q = await post('/fs', { action: 'missionQuestion', missionId, answer: 'D none' });
  assert.equal(q.parsed.key, 'D');
  const verify = await post('/fs', { action: 'missionVerify', missionId });
  assert.equal(verify.verification.ok, true);
  return missionId;
}

(async () => {
  const t0 = Date.now();
  const ids = [];
  for (let i = 0; i < total; i += 8) {
    ids.push(...await Promise.all(Array.from({ length: Math.min(8, total - i) }, (_, j) => missionCycle(i + j))));
  }
  console.log(JSON.stringify({ ok: true, suite: 'mission-shadow-stress', total, ids: ids.length, ms: Date.now() - t0 }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
