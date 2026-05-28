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
    const passiveEventsBefore = events.length;
    s2.prune();
    s2.list();
    s2.active();
    assert(events.length === passiveEventsBefore, "passive stream reads and cleanup must not re-announce into sidebar listeners", { before: passiveEventsBefore, after: events.length });
    s2.upsert({ id: "stream-a", cursor: 8, conversationId: "c1" });
    assert(events.length === passiveEventsBefore + 1, "real stream mutations should still announce once", { before: passiveEventsBefore, after: events.length });
    const runStore = new AutomationRunStore(makeStorage());
    const sends = [];
    const pipeline = makeFastPipeline(AutomationPipeline, {
      runStore,
      getSettings: () => ({ enabled: true, maxTurns: 2, delayMs: 0, streamSettleMs: 0, prompt: "continue", stopOnError: true }),
      sendPrompt: async (prompt, context) => sends.push({ prompt, context })
    });
    await Promise.all([
      pipeline.afterAssistantReply("a1", { conversationId: "c1" }),
      pipeline.afterAssistantReply("b1", { conversationId: "c2" })
    ]);
    await pipeline.afterAssistantReply("a2", { conversationId: "c1" });
    await pipeline.afterAssistantReply("a3", { conversationId: "c1" });
    assert(runStore.get("c1").turns === 2 && runStore.get("c2").turns === 1, "automation turns must be per conversation");
    assert(sends.filter(s => s.context.conversationId === "c1").length === 2, "c1 max turn guard must hold");

    const failStore = new AutomationRunStore(makeStorage());
    const failPipeline = makeFastPipeline(AutomationPipeline, {
      runStore: failStore,
      getSettings: () => ({ enabled: true, maxTurns: 3, delayMs: 0, streamSettleMs: 0, prompt: "continue", stopOnError: true }),
      sendPrompt: async () => { throw new Error("POST failed"); }
    });
    await failPipeline.afterAssistantReply("before failure", { conversationId: "c-fail" });
    const failedRun = failStore.get("c-fail");
    assert(failedRun.turns === 0 && failedRun.pendingTurn === 0 && failedRun.status === "error", "automation must not increment committed turns when sendPrompt fails", { failedRun });

    globalThis.location = { search: "?awtsmoosConversation=c-kick" };
    const kickSends = [];
    const kickStore = new AutomationRunStore(makeStorage());
    const kickPipeline = makeFastPipeline(AutomationPipeline, {
      runStore: kickStore,
      getSettings: () => ({ enabled: true, maxTurns: 1, delayMs: 0, streamSettleMs: 0, prompt: "continue", stopOnError: true }),
      sendPrompt: async (prompt, context) => { kickSends.push({ prompt, context }); return ""; }
    });
    await kickPipeline.onSettingsChanged({ enabled: true });
    await new Promise(resolve => setTimeout(resolve, 10));
    assert(kickSends.length === 1 && kickSends[0].context.conversationId === "c-kick", "turning automation on must send for current conversation after the configured wait", { kickSends });
    assert(kickStore.get("c-kick").turns === 1 && kickStore.get("c-kick").pendingTurn === 0, "successful kick must commit exactly one turn", { run: kickStore.get("c-kick") });

    globalThis.location = { search: "?awtsmoosConversation=c-empty" };
    const emptySends = [];
    const emptyPipeline = makeFastPipeline(AutomationPipeline, {
      runStore: new AutomationRunStore(makeStorage()),
      getSettings: () => ({ enabled: true, maxTurns: 3, delayMs: 0, streamSettleMs: 0, prompt: "continue", stopOnError: true }),
      sendPrompt: async (prompt, context) => { emptySends.push({ prompt, context }); return ""; }
    });
    await emptyPipeline.afterAssistantReply("finished stream text", { conversationId: "c-empty" });
    for (let i = 0; i < 50 && emptySends.length < 2; i++) await new Promise(resolve => setTimeout(resolve, 10));
    assert(emptySends.length >= 2, "automation must continue even when transport returns empty final string after a streamed turn", { emptySends });
    const fs = require("fs");
    const pipelineSource = fs.readFileSync(path.join(ROOT, "js/automation/pipeline.js"), "utf8");
    assert(/runStore\.remove\(conversationId\)/.test(pipelineSource), "turning automation on must reset stale per-conversation run state");
    assert(/pendingTurn/.test(pipelineSource) && /turns: committedTurns/.test(pipelineSource), "page automation must use pendingTurn until sendPrompt commits");
    assert(/onWaiting/.test(pipelineSource) && /waiting \$\{seconds\} second/.test(pipelineSource), "automation wait must expose a visible countdown hook");
    const panelSource = fs.readFileSync(path.join(ROOT, "js/automation/panel.js"), "utf8");
    assert(/input\.onchange\s*=\s*handler/.test(panelSource) && /input\.oninput\s*=\s*handler/.test(panelSource), "automation UI must bind checkbox/text changes to both input and change events");
    assert(/automation change failed/.test(panelSource), "automation UI must surface async kick failures in the status panel");
    return { events: events.length, sends: sends.length, kickSends: kickSends.length, tabIdsDifferent: true, uiEvents: true, failedTurns: failedRun.turns };
  });
}

function makeFastPipeline(AutomationPipeline, options = {}) {
  return new AutomationPipeline({
    settingsStore: { save: patch => patch },
    report: () => {},
    minDelayMs: 0,
    minStreamSettleMs: 0,
    ...options
  });
}

module.exports = { run };
