//B"H
const { assert, test, makeStorage } = require("./assert.cjs");
const path = require("path");
const { pathToFileURL } = require("url");
const { ROOT } = require("./assert.cjs");

/** B"H — Verifies durable stream state, tab identity, claims, and many automation runs. */
async function run() {
  return test("durable-stores-and-multi-automation", async () => {
    const events = [];
    globalThis.localStorage = makeStorage();
    globalThis.sessionStorage = makeStorage();
    globalThis.CustomEvent = class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } };
    globalThis.dispatchEvent = e => events.push(e);
    globalThis.location = { search: "" };
    const suffix = `?h=${Date.now()}${Math.random()}`;
    const streamUrl = pathToFileURL(path.join(ROOT, "js/chatgpt/stream/streamResumeStore.js")).href + suffix;
    const runUrl = pathToFileURL(path.join(ROOT, "js/automation/runStore.js")).href + suffix;
    const pipeUrl = pathToFileURL(path.join(ROOT, "js/automation/pipeline.js")).href + suffix;
    const { StreamResumeStore } = await import(streamUrl);
    const { AutomationRunStore } = await import(runUrl);
    const { AutomationPipeline } = await import(pipeUrl);
    const durable = makeStorage();
    const s1 = new StreamResumeStore(durable, makeStorage());
    s1.upsert({ id: "stream-a", cursor: 7, conversationId: "c1" });
    s1.claim("stream-a");
    const s2 = new StreamResumeStore(durable, makeStorage());
    assert(s2.list()[0].cursor === 7, "stream cursor must survive a new tab store");
    assert(s1.tabId !== s2.tabId, "two tab stores need different tab ids");
    assert(s2.list()[0].claimedBy === s1.tabId, "claim metadata must be visible cross-tab");
    const runStore = new AutomationRunStore(makeStorage());
    const sends = [];
    const pipeline = new AutomationPipeline({
      settingsStore: { save: patch => patch },
      getSettings: () => ({ enabled: true, maxTurns: 2, delayMs: 0, prompt: "continue", stopOnError: true }),
      sendPrompt: async (prompt, context) => sends.push({ prompt, context }),
      report: () => {},
      runStore
    });
    await Promise.all([
      pipeline.afterAssistantReply("a1", { conversationId: "c1" }),
      pipeline.afterAssistantReply("b1", { conversationId: "c2" })
    ]);
    await pipeline.afterAssistantReply("a2", { conversationId: "c1" });
    await pipeline.afterAssistantReply("a3", { conversationId: "c1" });
    assert(runStore.get("c1").turns === 2 && runStore.get("c2").turns === 1, "automation turns must be per conversation");
    assert(sends.filter(s => s.context.conversationId === "c1").length === 2, "c1 max turn guard must hold");
    return { events: events.length, sends: sends.length, tabIdsDifferent: true };
  });
}
module.exports = { run };
