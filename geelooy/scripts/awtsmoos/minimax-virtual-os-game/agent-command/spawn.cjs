// B"H
/**
 * @file spawn.cjs
 * @description
 * The command stone: spawn the swarm, return an agentId instantly, and leave
 * children running in the background. A watcher can then poll status every
 * five to ten seconds, killing stalled sparks and waiting for completion.
 */

const path = require("path");
const { spawn } = require("child_process");
const { writeAgent } = require("./store.cjs");

const TASKS = ["ui", "controls", "levels", "animation", "help", "api"];

function id(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function spawnChild(agentId, childId, task, rounds) {
  const childPath = path.join(__dirname, "subagent.cjs");
  const proc = spawn(process.execPath, [childPath, agentId, childId, task, String(rounds)], {
    cwd: path.resolve(__dirname, "../../../../../"),
    detached: true,
    stdio: "ignore"
  });
  proc.unref();
  return proc.pid;
}

function main() {
  const rounds = Number(process.env.AWTSMOOS_AGENT_ROUNDS || process.argv[2] || 8);
  const agentId = id("gameAgent");
  const children = TASKS.map(task => ({
    childId: id(task),
    task,
    status: "spawned",
    round: 0,
    pid: null,
    heartbeatAt: Date.now(),
    notes: []
  }));

  const agent = writeAgent({
    agentId,
    kind: "crystal-critters-ui-fix",
    status: "running",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    rounds,
    pollEveryMs: 5000,
    killAfterMs: 10000,
    children,
    events: [{ at: Date.now(), type: "spawned", childCount: children.length }],
    result: null
  });

  for (const child of agent.children) {
    child.pid = spawnChild(agentId, child.childId, child.task, rounds);
    child.status = "running";
    child.heartbeatAt = Date.now();
  }
  writeAgent(agent);
  console.log(JSON.stringify({ ok: true, agentId, status: "running", childCount: children.length, pollEveryMs: 5000 }, null, 2));
}

main();
