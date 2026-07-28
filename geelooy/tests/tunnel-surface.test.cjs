// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const Manifest = require("../apps/tunnel/agent/rebuild-manifest.cjs");
const SourcePaths = require("../apps/tunnel/agent/release/sourcePaths.js");

const root = path.resolve(__dirname, "..");

function nodeCheck(file) {
  const run = spawnSync(process.execPath, ["--check", file], { cwd: root, encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr || run.stdout);
}

const manifestPath = path.join(root, "apps/tunnel/agent/manifest.txt");
const [version, entry, ...files] = Manifest.cleanLines(
  fs.readFileSync(manifestPath, "utf8")
);
assert.match(version, /^\d+\.\d+\.\d+$/);
assert.equal(entry, "main.js");
assert.ok(files.length > 20);
const roots = SourcePaths.resolveRoots(path.resolve(root, ".."));
for (const file of [entry, ...files]) {
  const full = SourcePaths.sourcePathFor(file, roots);
  assert.ok(full, "Unsafe manifest file " + file);
  assert.ok(fs.existsSync(full), "Missing manifest file " + file);
  assert.ok(fs.statSync(full).isFile(), "Manifest entry is not a file " + file);
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

console.log(JSON.stringify({ ok: true, version, manifestFiles: files.length + 1, actions: actions.length }, null, 2));
