// B"H
const assert = require('assert');
const childProcess = require('child_process');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { commandStatus, jobDir } = require('../tools/fs/commandJobStore.js');

async function writeJob(config, jobId, meta) {
  const dir = jobDir(config, jobId);
  await fsp.mkdir(dir, { recursive: true });
  await fsp.writeFile(path.join(dir, 'stdout.txt'), '', 'utf8');
  await fsp.writeFile(path.join(dir, 'stderr.txt'), '', 'utf8');
  await fsp.writeFile(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
}

function meta(jobId, pid) {
  const startedAt = new Date().toISOString();
  return {
    BH: 'B"H',
    jobId,
    action: 'commandStart',
    requestAction: 'commandStart',
    actualAction: 'commandStart',
    command: 'synthetic detached recovery',
    cwd: process.cwd(),
    shell: 'sh',
    startedAt,
    status: 'running',
    pid,
    workerId: `worker_${jobId}`,
    receiptId: `receipt_${jobId}`,
    worker: { workerId: `worker_${jobId}`, jobId, kind: 'subprocess', state: 'running', pid, startedAt, heartbeatAt: startedAt },
    receipt: { receiptId: `receipt_${jobId}`, jobId, workerId: `worker_${jobId}`, action: 'commandStart', state: 'running', createdAt: startedAt },
    cost: { units: 1, wallMs: 0, outputBytes: 0, riskClass: 'long_running_command', timeoutMs: 30000 }
  };
}

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-detached-stale-'));
  const config = { root, allowCommands: true };
  const sleeper = childProcess.spawn(process.execPath, ['-e', 'setTimeout(()=>{}, 5000)'], { stdio: 'ignore' });
  try {
    await writeJob(config, 'detached-live', meta('detached-live', sleeper.pid));
    const detached = await commandStatus(config, { jobId: 'detached-live' });
    assert.strictEqual(detached.status, 'detached_running');
    assert.strictEqual(detached.worker.state, 'detached_running');

    await writeJob(config, 'stale-dead', meta('stale-dead', 99999999));
    const stale = await commandStatus(config, { jobId: 'stale-dead' });
    assert.strictEqual(stale.status, 'stale_lost_worker');
    assert.strictEqual(stale.receipt.state, 'stale_lost_worker');
    assert.strictEqual(stale.worker.detached, true);
  } finally {
    try { sleeper.kill('SIGTERM'); } catch {}
  }
  console.log(JSON.stringify({ ok: true, suite: 'detached-and-stale-worker-recovery' }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
