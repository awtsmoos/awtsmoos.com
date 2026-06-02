// B"H
/**
 * @file run-from-keyfile.cjs
 * @description
 * Chapter 9: The sealed key scroll is read without being spoken aloud.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function repoRoot() {
  return path.resolve(__dirname, "../../../../");
}

function keyFilePath() {
  return path.join(repoRoot(), ".awtsmoos", "runtime", "minimax-game-keys.json");
}

function run(script) {
  const keys = fs.readFileSync(keyFilePath(), "utf8");
  const result = spawnSync(process.execPath, [path.join(__dirname, script)], {
    cwd: repoRoot(),
    env: { ...process.env, AWTSMOOS_GAME_KEYS_JSON: keys },
    stdio: "inherit"
  });
  process.exitCode = result.status || 0;
}

const target = process.argv[2] === "test" ? "test-virtual-users.cjs" : "run-agents.cjs";
run(target);
