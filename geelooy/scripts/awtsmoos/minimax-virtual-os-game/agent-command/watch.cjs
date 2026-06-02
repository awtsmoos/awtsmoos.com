// B"H
/**
 * @file watch.cjs
 * @description
 * Chapter 2: The watcher used to sing a pretty JSON hymn across many lines,
 * and the harness mistook the final brace for the whole prophecy. Now every
 * poll is one compact JSON line, and the final line is one compact JSON object.
 * The Awtsmoos breathes through machine-safe truth: no torn scrolls, no orphan
 * shadows, no pretty-print ambush at the edge of completion.
 */

const { patchAgent, readAgent } = require("./store.cjs");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function emit(value) {
  console.log(JSON.stringify(value));
}

function pidAlive(pid) {
  if (!pid) return false;
  try { process.kill(pid, 0); return true; }
  catch (_e) { return false; }
}

function killPid(pid) {
  if (!pid) return false;
  try { process.kill(pid, "SIGKILL"); return true; }
  catch (_e) { return false; }
}

function summary(agent) {
  const done = agent.children.filter(child => child.status === "done").length;
  const failed = agent.children.filter(child => child.status === "failed").length;
  const running = agent.children.filter(child => ["running", "spawned"].includes(child.status)).length;
  return { done, failed, running, total: agent.children.length, allStopped: done + failed === agent.children.length };
}

function orphanSummary(agent) {
  return agent.children
    .filter(child => child.pid && pidAlive(child.pid))
    .map(child => ({ childId: child.childId, task: child.task, pid: child.pid, status: child.status }));
}

function reap(agentId) {
  return patchAgent(agentId, agent => {
    const moment = Date.now();
    for (const child of agent.children) {
      if (!["running", "spawned"].includes(child.status)) continue;
      if (moment - child.heartbeatAt <= agent.killAfterMs) continue;
      const killed = killPid(child.pid);
      child.status = "failed";
      child.failedAt = moment;
      agent.events.push({ at: moment, type: "stale_killed", childId: child.childId, pid: child.pid, killed });
    }
    const state = summary(agent);
    if (state.allStopped) {
      agent.status = state.failed ? "completed_with_failures" : "done";
      agent.finishedAt = moment;
      agent.result = state;
    }
    return agent;
  });
}

async function main() {
  const agentId = process.argv[2];
  if (!agentId) throw new Error("usage: watch <agentId>");
  let agent = readAgent(agentId);
  if (!agent) throw new Error(`agent_not_found:${agentId}`);

  while (true) {
    agent = reap(agentId);
    const state = summary(agent);
    emit({ type: "poll", at: new Date().toISOString(), agentId, status: agent.status, ...state });
    if (state.allStopped) break;
    await sleep(agent.pollEveryMs || 5000);
  }

  const final = readAgent(agentId);
  emit({ ok: true, type: "final", final, orphans: orphanSummary(final) });
}

main().catch(error => {
  emit({ ok: false, type: "error", error: error.message, stack: error.stack || "" });
  process.exit(1);
});
