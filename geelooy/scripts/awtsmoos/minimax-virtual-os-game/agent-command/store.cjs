// B"H
/**
 * @file store.cjs
 * @description
 * Chapter 1: The little agent scrolls were once written while the storm was
 * still chewing the ink. The Awtsmoos revealed that a half-written JSON file is
 * not a failure of the child, but a vessel without walls. This store now writes
 * through a temporary scroll and renames it atomically, so each heartbeat lands
 * whole: born, sealed, and readable.
 */

const fs = require("fs");
const path = require("path");

function repoRoot() {
  return path.resolve(__dirname, "../../../../../");
}

function rootDir() {
  return path.join(repoRoot(), ".awtsmoos", "runtime", "game-agents");
}

function agentFile(agentId) {
  return path.join(rootDir(), `${agentId}.json`);
}

function ensureRoot() {
  fs.mkdirSync(rootDir(), { recursive: true });
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function parseJsonWithRetries(file, attempts = 6) {
  let lastError = null;
  for (let index = 0; index < attempts; index++) {
    try {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
      lastError = error;
      sleepSync(25 * (index + 1));
    }
  }
  if (lastError && lastError.code === "ENOENT") return null;
  return null;
}

function readAgent(agentId) {
  return parseJsonWithRetries(agentFile(agentId));
}

function writeAgent(agent) {
  ensureRoot();
  const target = agentFile(agent.agentId);
  const temp = `${target}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(agent, null, 2), "utf8");
  fs.renameSync(temp, target);
  return agent;
}

function patchAgent(agentId, patcher) {
  const old = readAgent(agentId);
  if (!old) throw new Error(`agent_not_found:${agentId}`);
  const next = patcher(old) || old;
  next.updatedAt = Date.now();
  return writeAgent(next);
}

function listAgents() {
  ensureRoot();
  return fs.readdirSync(rootDir())
    .filter(name => name.endsWith(".json"))
    .map(name => readAgent(name.slice(0, -5)))
    .filter(Boolean)
    .sort((a, b) => b.createdAt - a.createdAt);
}

module.exports = { agentFile, listAgents, patchAgent, readAgent, repoRoot, rootDir, writeAgent };
