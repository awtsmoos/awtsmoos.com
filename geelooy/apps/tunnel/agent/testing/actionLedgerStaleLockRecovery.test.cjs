// B"H
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const installRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-ledger-lock-'));
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;

const Store = require('../tools/fs/actionLedgerStore.js');
const repositoryRoot = path.resolve(__dirname, '../../../..');
const config = {
  root: fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-ledger-project-')),
  repoRoot: repositoryRoot,
  tunnelName: 'stale-lock-proof'
};

async function run() {
try {
  const stalePath = Store.lockPath(config);
  fs.mkdirSync(path.dirname(stalePath), { recursive: true });
  fs.writeFileSync(stalePath, JSON.stringify({
    pid: 2147483647,
    mode: 'exclusive',
    at: Date.now() - 60_000
  }));

  Store.save(config, {
    actionId: 'act_after_stale_lock',
    action: 'stat',
    ok: true,
    createdAt: new Date().toISOString()
  }, { ok: true });

  assert.equal(fs.existsSync(stalePath), false, 'dead writer lock must be reclaimed');
  assert.equal((await Store.durableList(config)).at(-1)?.actionId, 'act_after_stale_lock');

  fs.writeFileSync(stalePath, JSON.stringify({
    pid: process.pid,
    mode: 'exclusive',
    at: Date.now()
  }));
  assert.throws(
    () => Store.assertUnlocked(config),
    error => error?.code === 'LEDGER_BUSY'
  );
  assert.equal(fs.existsSync(stalePath), true, 'live writer lock must never be removed');

  console.log(JSON.stringify({
    ok: true,
    suite: 'action-ledger-stale-lock-recovery',
    deadLockReclaimed: true,
    liveLockProtected: true,
    historyWriteRecovered: true
  }, null, 2));
} finally {
  fs.rmSync(installRoot, { recursive: true, force: true });
  fs.rmSync(config.root, { recursive: true, force: true });
}
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
