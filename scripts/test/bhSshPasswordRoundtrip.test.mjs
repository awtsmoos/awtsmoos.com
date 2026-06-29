// B"H
import assert from 'node:assert';
import { existsSync, mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const dir = mkdtempSync(join(tmpdir(), 'awt-bh-agent-'));
const env = {
  ...process.env,
  AWTSMOOS_BH_SECRET_BACKEND: 'awtsmoos-agent-box',
  AWTSMOOS_SSH_AGENT_ROOT: dir,
  AWTSMOOS_SSH_AGENT_KEY_FILE: join(dir, 'device.key'),
  AWTSMOOS_SSH_AGENT_BOX_FILE: join(dir, 'password.box.json')
};
const code = `import { savePassword, loadPassword, deletePassword, secretDescriptor } from './scripts/lib/safeSshPasswordStore.mjs';\nconst saved = savePassword('fake-test-password');\nif (loadPassword() !== 'fake-test-password') throw new Error('roundtrip_failed');\nconst desc = secretDescriptor();\nconst deleted = deletePassword();\nconsole.log(JSON.stringify({ ok: true, backend: desc.backend, saved, deleted, boxFile: desc.boxFile }));`;
const run = spawnSync(process.execPath, ['--input-type=module', '--eval', code], { cwd: process.cwd(), env, encoding: 'utf8' });
try {
  assert.strictEqual(run.status, 0, run.stdout + run.stderr);
  const result = JSON.parse(run.stdout);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.backend, 'awtsmoos-agent-box');
  assert.strictEqual(existsSync(join(dir, 'password.box.json')), false);
  assert.strictEqual(readFileSync(join(dir, 'device.key'), 'utf8').includes('fake-test-password'), false);
  console.log(JSON.stringify({ ok: true, suite: 'bh-ssh-password-roundtrip', backend: result.backend }, null, 2));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
