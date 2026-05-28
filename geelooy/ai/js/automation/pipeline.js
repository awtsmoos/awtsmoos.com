//B"H
import { automationRunStore } from "./runStore.js";
import { automationGraphStore } from "./graphStore.js";
import { evaluateAutomationGraph } from "./graphEngine.js";
import { automationArchiveStore } from "./messageArchive.js";
import { automationContinuationGate } from "./continuationGate.js";
import { parsePromptList } from "./settingsStore.js";

const WAIT_FRAMES = ["⌛", "⏳"];
const TICK_MS = 500;
const MIN_DELAY_MS = 5000;
const MIN_STREAM_SETTLE_MS = 1500;

/**
 * Chapter 112: Many Chats, One Honest Human Send Path.
 *
 * Each conversation owns its run state. The pipeline may cycle or randomly pick
 * prompts, yet the final act stays plain: call the same sendPrompt callback that
 * the Send button uses. No automation flag descends into the provider payload.
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
    for (const run of active) this.afterAssistantReply(run.lastReply || "", { conversationId: run.conversationId, resumed: true, allowEmpty:true });
    this.report(`automation resumed ${active.length} chat run${active.length === 1 ? "" : "s"}`);
  }

  reset(conversationId = null) {
    if (conversationId) this.runStore.remove(conversationId);
    else this.runStore.resetAll();
    this.clearTimer(conversationId || "*");
    this.onWaiting?.({ done:true, conversationId });
    this.report(conversationId ? `automation reset for this chat` : "automation reset");
  }

  onSettingsChanged(settings = {}) {
    const conversationId = getCurrentConversationId();
    if (!settings.enabled) return this.report("automation off for this chat");
    this.report("automation armed for this chat");
    if (conversationId) {
      this.runStore.remove(conversationId);
      this.afterAssistantReply("", { conversationId, manualKick: true, allowEmpty:true });
    }
  }

  async afterAssistantReply(replyText = "", context = {}) {
    const conversationId = context.conversationId || getCurrentConversationId();
    if (!conversationId) return this.report("automation waiting for conversation id");
    const settings = this.getSettings(conversationId);
    if (!settings.enabled) return this.mark(conversationId, { status: "off", pendingTurn: 0 }, "automation off for this chat");
    const source = context.resumed ? "resume" : context.completionPhase ? context.completionPhase : "live";
    if (context.completionPhase !== "post-settle") await this.archiveStore.add({ conversationId, role: "assistant", text: replyText, source });
    if (this.busy.has(conversationId)) return this.report(`automation already sending for this chat`);
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
    let assistantReply = "";
    let prompt = "";
    try {
      const decision = await this.chooseDecision({ conversationId, settings, run, replyText, nextTurn });
      if (decision.stop) return this.mark(conversationId, { status: "done", turns: committedTurns, pendingTurn: 0, lastReply: replyText }, decision.reason || "automation complete");
      prompt = selectPrompt(settings, decision.prompt || settings.prompt || "continue", nextTurn);
      this.mark(conversationId, { status: "sending", turns: committedTurns, pendingTurn: nextTurn, lastReply: replyText, lastPrompt: prompt, lastGraphNode: decision.nodeId || null }, `automation sending · ${nextTurn}/${settings.maxTurns}`);
      assistantReply = await this.sendPrompt(prompt, { conversationId });
      this.commitTurn({ conversationId, run, settings, decision, replyText, assistantReply, prompt, nextTurn });
    } catch (error) {
      this.mark(conversationId, { status: "error", turns: committedTurns, pendingTurn: 0, error: error.message || String(error), lastPrompt: prompt }, `automation error: ${error.message || error}`);
      if (settings.stopOnError) this.settingsStore.save({ enabled: false }, conversationId);
      return;
    }
    this.scheduleContinuation({ conversationId, context, settings, nextTurn, assistantReply, replyText });
  }

  async chooseDecision({ conversationId, settings, run, replyText, nextTurn }) {
    const graph = this.graphStore.load();
    const memory = run.memory || {};
    const graphStart = run.graphNode || graph.start;
    const decision = evaluateAutomationGraph({ ...graph, start: graphStart }, { lastReply: replyText, conversationId, turn: nextTurn, settings, memory });
    if (decision.archiveTag) await this.archiveStore.add({ conversationId, role: "assistant", text: replyText, source: "graph", tag: decision.archiveTag });
    if (Number(decision.delayMs || 0) > 0) await this.waitWithClock(conversationId, Number(decision.delayMs), `graph delay ${decision.nodeId || ""}`);
    return { ...decision, memory };
  }

  commitTurn({ conversationId, run, settings, decision, replyText, assistantReply, prompt, nextTurn }) {
    const finalReply = String(assistantReply || "").trim() ? assistantReply : replyText;
    const nextMemory = { ...(run.memory || {}), [decision.outputKey || "lastReply"]: finalReply };
    this.mark(conversationId, { status: "completed-turn", turns: nextTurn, pendingTurn: 0, lastReply: finalReply, lastPrompt: prompt, graphNode: decision.next || this.graphStore.load().start, memory: nextMemory }, `automation committed · ${nextTurn}/${settings.maxTurns}`);
  }

  scheduleContinuation({ conversationId, context, nextTurn, assistantReply, replyText }) {
    const continuationReply = typeof assistantReply === "string" ? (assistantReply.trim() || replyText || promptSummaryFromRun(this.runStore.get(conversationId))) : "";
    const freshSettings = this.getSettings(conversationId);
    if (!automationContinuationGate.canSchedule({ conversationId, replyText: continuationReply, settings: freshSettings, context:{ ...context, allowEmpty:true }, turns: nextTurn })) {
      return this.mark(conversationId, { status: "done", turns: nextTurn, pendingTurn: 0, lastReply: continuationReply }, "automation complete");
    }
    this.mark(conversationId, { status: "armed", turns: nextTurn, pendingTurn: 0, lastReply: continuationReply }, "automation next turn armed");
    setTimeout(() => this.afterAssistantReply(continuationReply, { conversationId, allowEmpty:true, completionPhase: "post-settle" }), 0);
  }

  async waitBeforeTurn(conversationId, nextTurn, settings = {}) {
    await this.waitWithClock(conversationId, Math.max(this.minStreamSettleMs, Number(settings.streamSettleMs || 0)), `settling stream before turn ${nextTurn}`);
    await this.waitWithClock(conversationId, Math.max(this.minDelayMs, Number(settings.delayMs || 0)), `waiting before turn ${nextTurn}`);
  }

  waitWithClock(conversationId, ms, label = "waiting") {
    const started = Date.now();
    const key = conversationId || "*";
    this.clearTimer(key);
    return new Promise(resolve => {
      const tick = () => {
        const elapsed = Date.now() - started;
        const left = Math.max(0, ms - elapsed);
        const frame = WAIT_FRAMES[Math.floor(elapsed / TICK_MS) % WAIT_FRAMES.length];
        const seconds = Math.ceil(left / 1000);
        const text = `${frame} automation ${label} · waiting ${seconds} second${seconds === 1 ? "" : "s"}`;
        this.report(text);
        this.onWaiting?.({ conversationId, text, leftMs:left, totalMs:ms, frame, done:false });
        if (left <= 0) { this.clearTimer(key); this.onWaiting?.({ conversationId, done:true }); resolve(); return; }
        this.timers.set(key, setTimeout(tick, TICK_MS));
      };
      tick();
    });
  }

  clearTimer(key = "*") {
    const ids = key === "*" ? [...this.timers.keys()] : [key];
    for (const id of ids) {
      clearTimeout(this.timers.get(id));
      this.timers.delete(id);
    }
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
function getCurrentConversationId() {
  try { return new URLSearchParams(location.search).get("awtsmoosConversation") || window.curConversationId || null; }
  catch { return null; }
}
function promptSummaryFromRun(run = {}) { return String(run.lastReply || run.lastPrompt || "").trim(); }
