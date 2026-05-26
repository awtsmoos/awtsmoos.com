// B"H
const { spawnSync } = require("child_process");
const path = require("path");

const publicRoot = path.resolve(__dirname, "..");
const tests = [
  ["Merkava runtime manifest", ["scripts/awtsmoos/MerkavaExecutor/run-merkava-runtime-tests.js"]],
  ["Tunnel shipped surface", ["tests/tunnel-surface.test.cjs"]],
  ["Tunnel source integration", ["apps/tunnel/agent/tools/fs/testing/source-runtime-bulk-commandtree.test.cjs"]],
  ["Merkava advanced runtime", ["scripts/awtsmoos/MerkavaExecutor/tests/merkava-runtime-advanced.test.cjs"]],
  ["Merkava linked bundle", ["tests/merkava-bundle.test.cjs"]],
  ["C++ compiler bridge", ["tests/cpp-compiler.test.mjs"]],
  ["Merkava executor render stream", ["apps/merkava-native-browser/core/testExecutorRenderStreamContract.mjs"]],
  ["Merkava native browser seed", ["apps/merkava-native-browser/build-seed.mjs"]],
  ["Native browser artifacts", ["tests/native-browser-artifacts.test.cjs"]],
  ["Native browser runtime", ["apps/merkava-native-browser/test-native-runtime.mjs"]]
];

let ok = true;
for (const [name, args] of tests) {
  const run = spawnSync(process.execPath, args, {
    cwd: publicRoot,
    stdio: "inherit",
    env: { ...process.env, NODE_NO_WARNINGS: "1" }
  });
  if (run.status !== 0) {
    ok = false;
    console.error(JSON.stringify({ ok: false, name, status: run.status }));
  }
}
if (!ok) process.exit(1);
console.log(JSON.stringify({ ok: true, tests: tests.map(([name]) => name) }, null, 2));
