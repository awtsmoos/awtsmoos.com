// B"H
import assert from "node:assert";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const dir = mkdtempSync(join(tmpdir(), "awt-bh-secret-"));
const file = join(dir, "secret.dpapi.txt");
const env = { ...process.env, AWTSMOOS_BH_SECRET_FILE: file, AWTSMOOS_BH_SECRET_SERVICE: "awtsmoos.test.bh", AWTSMOOS_BH_SECRET_ACCOUNT: "test@awtsmoos" };
const code = `import { savePassword, loadPassword, deletePassword, secretDescriptor } from './scripts/lib/safeSshPasswordStore.mjs';\nconst saved = savePassword('fake-test-password');\nif (loadPassword() !== 'fake-test-password') throw new Error('roundtrip_failed');\nconst deleted = deletePassword();\nconsole.log(JSON.stringify({ ok: true, backend: secretDescriptor().backend, saved, deleted }));`;
const run = spawnSync(process.execPath, ["--input-type=module", "--eval", code], { cwd: process.cwd(), env, encoding: "utf8" });
try {
  assert.strictEqual(run.status, 0, run.stdout + run.stderr);
  const result = JSON.parse(run.stdout);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(existsSync(file), false);
  console.log(JSON.stringify({ ok: true, suite: "bh-ssh-password-roundtrip", backend: result.backend }, null, 2));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
