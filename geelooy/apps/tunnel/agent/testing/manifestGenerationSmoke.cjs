// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "manifest.txt");
const before = fs.readFileSync(MANIFEST, "utf8");
const run = spawnSync(process.execPath, [path.join(ROOT, "rebuild-manifest.cjs")], { cwd: path.resolve(ROOT, "../../../.."), encoding: "utf8", env: { ...process.env, AWTSMOOS_AGENT_MANIFEST_VERSION: "1.0.55" } });
assert.strictEqual(run.status, 0, run.stdout + run.stderr);
const after = fs.readFileSync(MANIFEST, "utf8");
const lines = after.split(/\r?\n/).map(x => x.trim()).filter(x => x && x !== 'B"H' && x !== '# B"H');
assert.strictEqual(lines[0], "1.0.55");
assert.strictEqual(lines[1], "main.js");
const files = lines.slice(2);
assert(files.length >= 240, "manifest includes runtime files");
assert(files.length < 270, "manifest should not include test harness explosion");
assert.strictEqual(files.filter(x => /^testing\//.test(x) || /(^|\/)testing\//.test(x) || /\.test\./.test(x)).length, 0);
for (const file of files) {
  const source = file.startsWith("ai/") ? path.resolve(ROOT, "../../../..", "geelooy", file) : path.join(ROOT, file);
  assert(fs.existsSync(source), "manifest source exists: " + file);
}
console.log(JSON.stringify({ ok: true, suite: "manifest-generation-smoke", files: files.length, changed: before !== after }, null, 2));
