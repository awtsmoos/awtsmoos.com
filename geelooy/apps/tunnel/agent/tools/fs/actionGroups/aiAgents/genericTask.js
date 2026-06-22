// B"H
const fs = require("fs");
const path = require("path");
const { sendAgentMessage } = require("./client.js");
const { spawnChildTasks } = require("./childSpawner.js");
const { sleep } = require("./sleep.js");
const { taskLimits } = require("./taskLimits.js");
const store = require("./taskStore.js");

/**
 * B"H
 * Chapter 364: The Parent Waited While Children Burned Cleanly.
 *
 * The first spawn response is instant, but the background parent continues.
 * It asks for remaining work through configurable promotion cycles, launches
 * child ids without blocking the caller, polls them, and only completes after
 * every descendant leaves queued/running status.
 */
async function runGenericTask(config, task, runTask) {
  const limits = taskLimits(config, task.input);
  const texts = [];
  let spawned = [];
  for (let cycle = 0; cycle <= limits.promotionCycles; cycle++) {
    const result = await askDelegate(config, task, cycle, texts);
    texts.push(result.text || "");
    if (canSpawn(task, limits)) {
      spawned.push(...spawnChildTasks(config, task, extractChildren(result.text), runTask));
    }
    store.event(task, "Promotion cycle completed.", { cycle, spawnedTotal: spawned.length });
    if (cycle < limits.promotionCycles) await sleep(limits.pollIntervalMs);
  }
  await waitForFamily(config, task, limits);
  const file = maybeWrite(config, task, texts.join("\n\n---\n\n"));
  return { kind: "genericTask", text: texts.join("\n\n"), file, childTaskIds: task.childTaskIds || [], cycles: limits.promotionCycles + 1 };
}

async function askDelegate(config, task, cycle, previous) {
  store.event(task, "Delegate prompt started.", { cycle });
  const result = await sendAgentMessage(config, withSpawnSystem(task.input, cycle, previous));
  if (!result.ok) throw new Error(JSON.stringify(result));
  return result;
}

async function waitForFamily(config, task, limits) {
  const rootId = task.input.rootTaskId || task.rootTaskId || task.id;
  let guard = 0;
  while (store.activeFamily(rootId, task).filter(t => t.id !== task.id).length && guard++ < limits.maxTotalTasks * 3) {
    store.event(task, "Polling child family.", { active: store.activeFamily(rootId, task).map(t => t.id) });
    await sleep(limits.pollIntervalMs);
  }
}

function canSpawn(task, limits) {
  return limits.allowRecursiveSpawn && Number(task.input.depth || 0) < limits.maxDepth;
}

function withSpawnSystem(input = {}, cycle = 0, previous = []) {
  return {
    ...input,
    message: cyclePrompt(input, cycle, previous),
    system: [
      input.system || "You are an Awtsmoos delegate doing a large task.",
      "Return useful work now.",
      "Then append awtsmoos_agent_tasks: followed by a JSON array of child tasks when allowed.",
      "Each child can include title, prompt, kind, provider, agentId, model, fileName, outputDir.",
      "Prefer concrete remaining steps; never include placeholders."
    ].join(" ")
  };
}

function cyclePrompt(input = {}, cycle = 0, previous = []) {
  if (cycle === 0) return input.prompt || input.message || "Do the delegated task.";
  return [
    "Promotion cycle " + cycle + ": list remaining things to do, then do the next concrete step.",
    "Spawn sub agents for independent remaining work when useful.",
    "Prior work:", previous.slice(-2).join("\n\n")
  ].join("\n\n");
}

function extractChildren(text = "") {
  const marker = "awtsmoos_agent_tasks";
  const i = String(text).indexOf(marker);
  if (i < 0) return [];
  const tail = String(text).slice(i + marker.length);
  const start = tail.indexOf("[");
  if (start < 0) return [];
  try { const parsed = JSON.parse(balancedArray(tail.slice(start))); return Array.isArray(parsed) ? parsed.filter(x => x && x.prompt) : []; }
  catch { return []; }
}

function balancedArray(text) {
  let depth = 0, inside = false, escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escaped) { escaped = false; continue; }
    if (inside && ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inside = !inside; continue; }
    if (inside) continue;
    if (ch === "[") depth++;
    if (ch === "]" && --depth === 0) return text.slice(0, i + 1);
  }
  return "[]";
}

function maybeWrite(config, task, text) {
  if (!task.input.fileName && !task.input.outputDir) return null;
  const base = path.resolve(config.root || process.cwd());
  const dir = path.resolve(base, task.input.outputDir || "AI_THOUGHTS/agent-tasks");
  if (!dir.startsWith(base)) throw new Error("outputDir escapes configured root");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, task.input.fileName || `${task.id}.md`);
  fs.writeFileSync(file, "# " + (task.input.title || task.id) + "\n\n" + String(text || "").trim() + "\n", "utf8");
  return file;
}

module.exports = { extractChildren, runGenericTask };
