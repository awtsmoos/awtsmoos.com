// B"H
const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function nodeCheck(file) {
  const run = spawnSync(process.execPath, ["--check", file], { cwd: root, encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr || run.stdout);
}

const manifestPath = path.join(root, "apps/tunnel/agent/manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
assert.equal(manifest.entry, "main.js");
assert.ok(manifest.files.length > 20);
for (const item of manifest.files) {
  const full = path.join(root, "apps/tunnel/agent", item.path);
  assert.ok(fs.existsSync(full), "Missing manifest file " + item.path);
  assert.equal(fs.statSync(full).size, item.bytes, "Size mismatch " + item.path);
  assert.equal(sha256(full), item.sha256, "Hash mismatch " + item.path);
}

const { actions } = require("../api/tunnel/control/docs/actions.js");
const yaml = fs.readFileSync(path.join(root, "apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml"), "utf8");
const live = fs.readFileSync(path.join(root, "apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml"), "utf8");
assert.equal(yaml, live);
for (const action of actions) assert.ok(yaml.includes(`              - ${action}`), "YAML missing " + action);

[
  "apps/tunnel/agent/main.js",
  "apps/tunnel/agent/tools/fs/actions.js",
  "apps/tunnel/agent/tools/chrome/index.js",
  "apps/tunnel/agent/tools/command/index.js",
  "api/tunnel/_awtsmoos.derech.js",
  "api/tunnel/control/_awtsmoos.derech.js",
  "api/tunnel/control/core/tunnelPayload.js",
  "api/tunnel/control/routes/osFs.js"
].forEach(nodeCheck);

console.log(JSON.stringify({ ok: true, manifestFiles: manifest.files.length, actions: actions.length }, null, 2));
