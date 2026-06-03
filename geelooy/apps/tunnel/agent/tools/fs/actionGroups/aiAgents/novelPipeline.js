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
 * Chapter 398: The Novel Orchestra Wrote A Text Ledger, Not A JSON Husk.
 *
 * Chapter runs now leave a plain manifest-style report. The old JSON name is
 * not spoken; the output stays human-readable and installer-safe.
 */
async function runNovelTask(config, task, runTask) {
  const outputDir = safeOutputDir(config.root, task.input.outputDir);
  fs.mkdirSync(outputDir, { recursive: true });
  if ((task.input.kind || "") === "novelOrchestra") return orchestrateNovel(config, task, outputDir, runTask);
  return writeChapter(config, task, outputDir);
}
async function orchestrateNovel(config, task, outputDir, runTask) {
  const count = Math.max(16, Number(task.input.chapterCount || 16));
  const specs = Array.from({ length: count }, (_, i) => chapterSpec(config, task.input, outputDir, i + 1, count));
  const children = spawnChildTasks(config, task, specs, runTask);
  store.event(task, "Novel chapter children spawned.", { count: children.length, outputDir });
  await waitForChildren(config, task);
  const childRecords = children.map(child => store.readTask(child.id)).filter(Boolean);
  const files = childRecords.map(child => child.output?.file).filter(Boolean);
  const ledgerFile = path.join(outputDir, "novel-manifest.txt");
  writeTextLedger(ledgerFile, { taskId: task.id, childTaskIds: children.map(x => x.id), outputDir, chapterCycles: specs[0]?.chapterCycles || 8, files, chapters: childRecords.map(chapterSummary), createdAt: new Date().toISOString() });
  return { kind: "novelOrchestra", outputDir, childTaskIds: children.map(x => x.id), files: [...files, ledgerFile], chapterCycles: specs[0]?.chapterCycles || 8 };
}
async function writeChapter(config, task, outputDir) {
  const limits = taskLimits(config, task.input);
  const chapter = Number(task.input.chapterNumber || 1);
  const count = Number(task.input.chapterCount || 16);
  const cycles = Number(task.input.chapterCycles || task.input.agentCycles || limits.agentCycles || 8);
  let draft = "";
  const passes = [];
  for (let cycle = 1; cycle <= cycles; cycle++) {
    const prompt = cycle === 1 ? firstChapterPrompt(task.input, chapter, count) : expansionPrompt(task.input, chapter, count, cycle, cycles, draft);
    const result = await sendAgentMessage(config, { agentId: task.input.agentId || "minimax-deep", provider: task.input.provider || "minimax", model: task.input.model, stream: task.input.stream !== false, system: authorSystem(cycle, cycles), message: prompt });
    if (!result.ok) throw new Error(JSON.stringify(result));
    draft = mergeDraft(draft, result.text || "");
    passes.push({ cycle, chars: draft.length, usage: result.usage || null, finishReason: result.finishReason || null });
    store.event(task, "Chapter cycle completed.", { chapter, cycle, chars: draft.length });
  }
  const file = path.join(outputDir, task.input.fileName || chapterName(chapter));
  fs.writeFileSync(file, markdown("Chapter " + chapter, draft), "utf8");
  writeTextLedger(path.join(outputDir, passName(chapter)), { taskId: task.id, chapter, cycles, passes, file });
  return { kind: "novelChapter", file, text: draft, usage: lastUsage(passes), cycles, passes };
}
async function waitForChildren(config, task) {
  const limits = taskLimits(config, task.input);
  let guard = 0;
  while (store.childrenOf(task.id).some(x => ["queued", "running"].includes(x.status)) && guard++ < limits.maxTotalTasks * 3) {
    store.event(task, "Polling novel children.", { active: store.childrenOf(task.id).filter(x => ["queued", "running"].includes(x.status)).map(x => x.id) });
    await sleep(limits.pollIntervalMs);
  }
}
function chapterSpec(config, input, outputDir, chapter, count) { const limits = taskLimits(config, input); return { kind: "novelChapter", title: "Novel chapter " + chapter, chapterNumber: chapter, chapterCount: count, chapterCycles: Number(input.chapterCycles || input.agentCycles || limits.agentCycles || 8), outputDir, fileName: chapterName(chapter), prompt: firstChapterPrompt(input, chapter, count) }; }
function firstChapterPrompt(input = {}, chapter = 1, count = 16) { return [input.prompt || "Write a complete vivid novel about the Awtsmoos revealed through a living tunnel of agents.", `This is chapter ${chapter} of ${count}.`, "Write the actual chapter now. Make it coherent, cinematic, and distinct.", "No placeholders. No outline only. No apology. No mock text."].join("\n"); }
function expansionPrompt(input = {}, chapter = 1, count = 16, cycle = 2, cycles = 8, draft = "") { return [`This is autonomous chapter cycle ${cycle} of ${cycles} for chapter ${chapter} of ${count}.`, "Keep writing. Expand the chapter substantially with richer scenes, continuity, dialogue, consequence, and images.", "Return the entire improved chapter, not notes. It must be longer and more finished than the draft.", "Do not say placeholder, mock, mocked, summary only, or outline.", "Current draft:", String(draft || "").slice(-12000)].join("\n\n"); }
function mergeDraft(previous = "", next = "") { const clean = String(next || "").trim(); if (!previous) return clean; if (clean.length >= previous.length * 1.08) return clean; return [previous.trim(), clean].filter(Boolean).join("\n\n"); }
function chapterSummary(task) { return { id: task.id, status: task.status, file: task.output?.file || null, cycles: task.output?.cycles || 0, chars: String(task.output?.text || "").length }; }
function safeOutputDir(root, given) { const base = path.resolve(root || process.cwd()); const rel = given || path.join("AI_THOUGHTS", "novel-agent-runs", new Date().toISOString().replace(/[:.]/g, "-")); const resolved = path.resolve(base, rel); if (!resolved.startsWith(base)) throw new Error("outputDir escapes configured root"); return resolved; }
function chapterName(chapter) { return `chapter-${String(chapter).padStart(2, "0")}.md`; }
function passName(chapter) { return `chapter-${String(chapter).padStart(2, "0")}.passes.txt`; }
function markdown(title, text) { return "# " + title + "\n\n" + String(text || "").trim() + "\n"; }
function writeTextLedger(file, value) { fs.writeFileSync(file, ['B"H', ...Object.entries(value).map(([key, val]) => `${key}: ${typeof val === "string" ? val : JSON.stringify(val)}`), ""].join("\n"), "utf8"); }
function lastUsage(passes = []) { return passes.length ? passes[passes.length - 1].usage : null; }
function authorSystem(cycle, cycles) { return `B'H. You are a vivid literary AI novelist. Cycle ${cycle}/${cycles}: write complete expanded prose only, no fences, no placeholders.`; }
module.exports = { runNovelTask };
