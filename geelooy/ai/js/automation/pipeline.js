//B"H
import { automationRunStore } from "./runStore.js";
import { automationGraphStore } from "./graphStore.js";
import { evaluateAutomationGraph } from "./graphEngine.js";
import { automationArchiveStore } from "./messageArchive.js";
import { automationContinuationGate } from "./continuationGate.js";
import { parsePromptList, randomDelayMs } from "./settingsStore.js";

const WAIT_FRAMES = ["⌛", "⏳"];
const TICK_MS = 500;
const MIN_DELAY_MS = 5000;
const MIN_STREAM_SETTLE_MS = 1500;

/**
 * B"H
 * Chapter 247: The Test Clock And The Human Clock Each Kept Their Covenant.
 *
 * Production automation keeps its human delay floor. Harnesses and explicitly
 * constructed fast pipelines may set minDelayMs/minStreamSettleMs to zero, and
 * this class now honors that override instead of secretly resurrecting the
 * global five-second floor through randomDelayMs().
 */
export class AutomationPipeline {
  constructor({ settingsStore, getSettings, sendPrompt, report, onWaiting = null, minDelayMs = MIN_DELAY_MS, minStreamSettleMs = MIN_STREAM_SETTLE_MS, runStore = automationRunStore, graphStore = automationGraphStore, archiveStore = automationArchiveStore }) {
    this.settingsStore = settingsStore;
    this.getSettings = getSettings;
    this.sendPrompt = sendPrompt;
    this.report = report || (() => {});
    this.onWaiting = onWaiting;
    this.runStore = runStore;
    this.graphStore = graphStore;
    this.archiveStore = archiveStore;
    this.minDelayMs = Math.max(0, Number(minDelayMs));
    this.minStreamSettleMs = Math.max(0, Number(minStreamSettleMs));
    this.busy = new Set();
    this.timers = new Map();
  }

  resumeActiveRuns() {
    const active = this.runStore.list().filter(run => !["done", "error", "off"].includes(run.status));
    if (!active.length) return this.report("automation armed for this chat only");
    for (const run of active) this.afterAssistantReply(run.lastReply || "", { conversationId: run.conversationId, resumed: true, allowEmpty: true });
    this.report(`automation resumed ${active.length} chat run${active.length === 1 ? "" : "s"}`);
  }

  reset(conversationId = null) {
    if (conversationId) this.runStore.remove(conversationId); else this.runStore.resetAll();
    this.clearTimer(conversationId || "*");
    this.onWaiting?.({ done: true, conversationId });
    this.report(conversationId ? "automation reset for this chat" : "automation reset");
  }

  async onSettingsChanged(settings = {}) {
    const conversationId = getCurrentConversationId();
    if (!settings.enabled) return this.report("automation off for this chat");
    this.report("automation armed for this chat");
    if (!conversationId) return;
    this.runStore.remove(conversationId);
    return await this.afterAssistantReply("", { conversationId, manualKick: true, allowEmpty: true });
  }

  async afterAssistantReply(replyText = "", context = {}) {
    const conversationId = context.conversationId || getCurrentConversationId();
    if (!conversationId) return this.report("automation waiting for conversation id");
    const settings = this.getSettings(conversationId);
    if (!settings.enabled) return this.mark(conversationId, { status: "off", pendingTurn: 0 }, "automation off for this chat");
    if (context.completionPhase !== "post-settle") await this.archiveStore.add({ conversationId, role: "assistant", text: replyText, source: context.resumed ? "resume" : "live" });
    if (this.busy.has(conversationId)) return this.report("automation already sending for this chat");
    const run = this.runStore.get(conversationId) || { conversationId, turns: 0, lastReply: "" };
    const committedTurns = Number(run.turns || 0);
    if (committedTurns >= Number(settings.maxTurns || 0)) return this.mark(conversationId, { status: "done", pendingTurn: 0 }, "automation complete");
    this.busy.add(conversationId);
    try { await this.runOneTurn({ conversationId, settings, run, replyText, committedTurns, context }); }
    finally { this.busy.delete(conversationId); }
  }

  async runOneTurn({ conversationId, settings, run, replyText, committedTurns, context }) {
    const nextTurn = committedTurns + 1;
    this.mark(conversationId, { status: "waiting", pendingTurn: nextTurn, turns: committedTurns, lastReply: replyText }, `automation waiting · ${nextTurn}/${settings.maxTurns}`);
    await this.waitBeforeTurn(conversationId, nextTurn, settings);
    try {
      const decision = await this.chooseDecision({ conversationId, settings, run, replyText, nextTurn });
      if (decision.stop) return this.mark(conversationId, { status: "done", turns: committedTurns, pendingTurn: 0, lastReply: replyText }, decision.reason || "automation complete");
      const prompt = selectPrompt(settings, decision.prompt || settings.prompt || "continue", nextTurn);
      this.mark(conversationId, { status: "sending", turns: committedTurns, pendingTurn: nextTurn, lastReply: replyText, lastPrompt: prompt, lastGraphNode: decision.nodeId || null }, `automation sending · ${nextTurn}/${settings.maxTurns}`);
      const assistantReply = await this.sendPrompt(prompt, { conversationId, source: "automation-visible-send" });
      this.commitTurn({ conversationId, run, settings, decision, replyText, assistantReply, prompt, nextTurn });
      this.scheduleContinuation({ conversationId, context, nextTurn, assistantReply, replyText });
    } catch (error) { this.handleTurnError({ conversationId, settings, committedTurns, error }); }
  }

  async chooseDecision({ conversationId, settings, run, replyText, nextTurn }) {
    const graph = this.graphStore.load();
    const decision = evaluateAutomationGraph({ ...graph, start: run.graphNode || graph.start }, { lastReply: replyText, conversationId, turn: nextTurn, settings, memory: run.memory || {} });
    if (decision.archiveTag) await this.archiveStore.add({ conversationId, role: "assistant", text: replyText, source: "graph", tag: decision.archiveTag });
    if (Number(decision.delayMs || 0) > 0) await this.waitWithClock(conversationId, Number(decision.delayMs), `graph delay ${decision.nodeId || ""}`);
    return { ...decision, memory: run.memory || {} };
  }

  commitTurn({ conversationId, run, settings, decision, replyText, assistantReply, prompt, nextTurn }) {
    const finalReply = String(assistantReply || "").trim() ? assistantReply : replyText;
    const nextMemory = { ...(run.memory || {}), [decision.outputKey || "lastReply"]: finalReply };
    this.mark(conversationId, { status: "completed-turn", turns: nextTurn, pendingTurn: 0, lastReply: finalReply, lastPrompt: prompt, graphNode: decision.next || this.graphStore.load().start, memory: nextMemory }, `automation committed · ${nextTurn}/${settings.maxTurns}`);
  }

  scheduleContinuation({ conversationId, context, nextTurn, assistantReply, replyText }) {
    const continuationReply = String(assistantReply || "").trim() || replyText || promptSummaryFromRun(this.runStore.get(conversationId));
    const settings = this.getSettings(conversationId);
    const gate = automationContinuationGate.canSchedule({ conversationId, replyText: continuationReply, settings, context: { ...context, allowEmpty: true }, turns: nextTurn });
    if (!gate) return this.mark(conversationId, { status: "done", turns: nextTurn, pendingTurn: 0, lastReply: continuationReply }, "automation complete");
    this.mark(conversationId, { status: "armed", turns: nextTurn, pendingTurn: 0, lastReply: continuationReply }, "automation next turn armed");
    setTimeout(() => this.afterAssistantReply(continuationReply, { conversationId, allowEmpty: true, completionPhase: "post-settle" }), 0);
  }

  async waitBeforeTurn(conversationId, nextTurn, settings = {}) {
    const settle = this.minStreamSettleMs === 0 ? Math.max(0, Number(settings.streamSettleMs || 0)) : Math.max(this.minStreamSettleMs, Number(settings.streamSettleMs || 0));
    const delay = this.minDelayMs === 0 ? Math.max(0, Number(settings.delayMs || settings.delayMinMs || 0)) : Math.max(this.minDelayMs, randomDelayMs(settings));
    await this.waitWithClock(conversationId, settle, `settling stream before turn ${nextTurn}`);
    await this.waitWithClock(conversationId, delay, `random delay before turn ${nextTurn}`);
  }

  waitWithClock(conversationId, ms, label = "waiting") {
    const started = Date.now();
    const key = conversationId || "*";
    this.clearTimer(key);
    return new Promise(resolve => {
      const tick = () => {
        const left = Math.max(0, ms - (Date.now() - started));
        const frame = WAIT_FRAMES[Math.floor((Date.now() - started) / TICK_MS) % WAIT_FRAMES.length];
        const seconds = Math.ceil(left / 1000);
        const text = `${frame} automation ${label} · waiting ${seconds} second${seconds === 1 ? "" : "s"}`;
        this.report(text);
        this.onWaiting?.({ conversationId, text, leftMs: left, totalMs: ms, frame, done: false });
        if (left <= 0) { this.clearTimer(key); this.onWaiting?.({ conversationId, done: true }); resolve(); return; }
        this.timers.set(key, setTimeout(tick, TICK_MS));
      };
      tick();
    });
  }

  handleTurnError({ conversationId, settings, committedTurns, error }) {
    this.mark(conversationId, { status: "error", turns: committedTurns, pendingTurn: 0, error: error.message || String(error) }, `automation error: ${error.message || error}`);
    if (settings.stopOnError) this.settingsStore.save({ enabled: false }, conversationId);
  }

  clearTimer(key = "*") {
    const ids = key === "*" ? [...this.timers.keys()] : [key];
    for (const id of ids) { clearTimeout(this.timers.get(id)); this.timers.delete(id); }
  }

  mark(conversationId, patch, message = "") {
    this.runStore.patch(conversationId, patch);
    if (message) this.report(message);
  }
}

function selectPrompt(settings = {}, fallback = "continue", turn = 1) {
  const prompts = parsePromptList(settings);
  if (!prompts.length || settings.promptMode === "single") return String(fallback || settings.prompt || "continue");
  if (settings.promptMode === "random") return prompts[Math.floor(Math.random() * prompts.length)] || fallback;
  return prompts[(Math.max(1, Number(turn || 1)) - 1) % prompts.length] || fallback;
}
function getCurrentConversationId() { try { return new URLSearchParams(location.search).get("awtsmoosConversation") || globalThis.curConversationId || globalThis.window?.curConversationId || null; } catch { return null; } }
function promptSummaryFromRun(run = {}) { return String(run.lastReply || run.lastPrompt || "").trim(); }
