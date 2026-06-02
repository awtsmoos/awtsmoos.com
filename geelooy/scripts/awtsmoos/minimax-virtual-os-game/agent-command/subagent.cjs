// B"H
/**
 * @file subagent.cjs
 * @description
 * A child worker receives one slab of the cave, writes progress heartbeats, and
 * exits. Late final writes may race with parent shutdown; those are ignored so
 * a completed child is not marked failed after it already served the swarm.
 */

const { patchAgent } = require("./store.cjs");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function safePatch(agentId, patcher) {
  try { return patchAgent(agentId, patcher); }
  catch (_e) { return null; }
}

function taskText(task, round) {
  const table = {
    ui: "Shrink controls, restore readable cave, use compact floating controls, keep browser chrome clear.",
    controls: "Prefer swipe/tap-canvas first, make buttons small backup only, no huge dock covering playfield.",
    levels: "Add lots of varied levels while keeping early levels readable on mobile.",
    animation: "Add walking frames, easing, hit flash, crystal pickup bursts, and critter idle pulses.",
    help: "Move instructions into a compact pop-up and keep notes collapsed by default.",
    api: "Design spawn/status/watch commands: spawn returns agentId immediately; parent polls until done."
  };
  return `${task} round ${round}: ${table[task] || "improve the game in one concrete way"}`;
}

async function main() {
  const agentId = process.argv[2];
  const childId = process.argv[3];
  const task = process.argv[4];
  const rounds = Number(process.argv[5] || 8);
  if (!agentId || !childId || !task) throw new Error("usage: subagent <agentId> <childId> <task> <rounds>");

  for (let round = 1; round <= rounds; round++) {
    await sleep(650 + Math.floor(Math.random() * 600));
    safePatch(agentId, agent => {
      const child = agent.children.find(item => item.childId === childId);
      if (!child || child.status === "failed") return agent;
      child.status = "running";
      child.round = round;
      child.heartbeatAt = Date.now();
      child.notes.push(taskText(task, round));
      agent.events.push({ at: Date.now(), childId, task, round, type: "progress" });
      return agent;
    });
  }

  safePatch(agentId, agent => {
    const child = agent.children.find(item => item.childId === childId);
    if (child && child.status !== "failed") {
      child.status = "done";
      child.finishedAt = Date.now();
      child.heartbeatAt = Date.now();
      agent.events.push({ at: Date.now(), childId, task, type: "done" });
    }
    return agent;
  });
}

main().catch(error => {
  const agentId = process.argv[2];
  const childId = process.argv[3];
  if (agentId && childId) {
    safePatch(agentId, agent => {
      const child = agent.children.find(item => item.childId === childId);
      if (child) child.status = "failed";
      agent.events.push({ at: Date.now(), childId, type: "failed", error: error.message });
      return agent;
    });
  }
  console.error(error);
  process.exit(1);
});
