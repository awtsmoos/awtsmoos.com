// B"H
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const WORKERS = Math.max(1, Number(process.env.AWTSMOOS_LEDGER_TEST_WORKERS || 4));
const WRITES_PER_WORKER = Math.max(1, Number(process.env.AWTSMOOS_LEDGER_TEST_WRITES || 25));

async function worker() {
  const root = process.argv[3];
  const repoRoot = process.argv[4];
  const workerId = process.argv[5];
  const Ledger = require('../tools/fs/actionLedger.js');
  const config = { root, repoRoot, tunnelName: 'ledger-concurrency-proof' };
  for (let index = 0; index < WRITES_PER_WORKER; index += 1) {
    const result = await Ledger.record(config, {
      action: 'concurrencyProof',
      workerId,
      index
    }, {
      ok: true,
      action: 'concurrencyProof',
      workerId,
      index
    });
    assert.equal(result.replayable, true, JSON.stringify(result.ledgerWarning || result));
    assert.equal(result.ledgerWarning, undefined);
  }
}

function spawnWorker(root, repoRoot, installRoot, workerId) {
  return new Promise((resolve, reject) => {
    const child = childProcess.spawn(process.execPath, [
      __filename,
      '--worker',
      root,
      repoRoot,
      String(workerId)
    ], {
      env: { ...process.env, AWTSMOOS_INSTALL_ROOT: installRoot },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.once('error', reject);
    child.once('exit', code => code === 0
      ? resolve()
      : reject(new Error(`ledger_worker_${workerId}_failed:${code}\n${stdout}\n${stderr}`)));
  });
}

async function main() {
  const installRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-ledger-concurrency-install-'));
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-ledger-concurrency-project-'));
  const repoRoot = path.resolve(__dirname, '../../../../..');
  process.env.AWTSMOOS_INSTALL_ROOT = installRoot;
  try {
    const startedAt = Date.now();
    await Promise.all(Array.from(
      { length: WORKERS },
      (_, index) => spawnWorker(root, repoRoot, installRoot, index)
    ));
    const elapsedMs = Date.now() - startedAt;
    const Store = require('../tools/fs/actionLedgerStore.js');
    const history = await Store.durableList({
      root,
      repoRoot,
      tunnelName: 'ledger-concurrency-proof'
    });
    const deferred = Store.pendingRows({
      root,
      repoRoot,
      tunnelName: 'ledger-concurrency-proof'
    });
    const attempted = WORKERS * WRITES_PER_WORKER;
    if (attempted <= 500) {
      assert.equal(history.length, attempted, `history=${history.length} deferred=${deferred.length}`);
    } else {
      assert.equal(history.length <= 500, true, `history exceeded retention: ${history.length}`);
      assert.equal(history.length >= 450, true, `history pruned too aggressively: ${history.length}`);
    }
    assert.equal(fs.existsSync(Store.lockPath({
      root,
      repoRoot,
      tunnelName: 'ledger-concurrency-proof'
    })), false);
    assert.equal(elapsedMs < 5000, true, `receipt writes took ${elapsedMs}ms`);
    console.log(JSON.stringify({
      ok: true,
      suite: 'action-ledger-concurrency',
      workers: WORKERS,
      attempted,
      writes: history.length,
      warnings: 0,
      lockReleased: true,
      elapsedMs
    }, null, 2));
  } finally {
    fs.rmSync(installRoot, { recursive: true, force: true });
    fs.rmSync(root, { recursive: true, force: true });
  }
}

(process.argv[2] === '--worker' ? worker() : main()).catch(error => {
  console.error(error);
  process.exit(1);
});
