// B"H
/**
 * @file status.cjs
 * @description
 * A small status oracle for spawned game agents.
 */

const { readAgent } = require("./store.cjs");

function main() {
  const agentId = process.argv[2];
  if (!agentId) throw new Error("usage: status <agentId>");
  const agent = readAgent(agentId);
  if (!agent) throw new Error(`agent_not_found:${agentId}`);
  const done = agent.children.filter(child => child.status === "done").length;
  const failed = agent.children.filter(child => child.status === "failed").length;
  console.log(JSON.stringify({
    ok: true,
    agentId,
    status: agent.status,
    done,
    failed,
    total: agent.children.length,
    children: agent.children.map(child => ({
      childId: child.childId,
      task: child.task,
      status: child.status,
      round: child.round,
      pid: child.pid,
      heartbeatAgeMs: Date.now() - child.heartbeatAt,
      lastNote: child.notes[child.notes.length - 1] || null
    }))
  }, null, 2));
}

main();
