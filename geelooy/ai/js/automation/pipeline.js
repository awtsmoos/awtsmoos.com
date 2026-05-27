//B"H
import { automationRunStore } from "./runStore.js";
import { automationGraphStore } from "./graphStore.js";
import { evaluateAutomationGraph } from "./graphEngine.js";
import { automationArchiveStore } from "./messageArchive.js";
import { automationContinuationGate } from "./continuationGate.js";

/**
 * Page-fallback automation loop.
 *
 * The extension background is the preferred owner. This class now behaves as a
 * dumb fallback only: wait, send as if the user pressed Enter, commit, repeat
 * until maxTurns or real send error. No repeated-text stop guard is allowed.
 */
export class AutomationPipeline {
  constructor({ settingsStore, getSettings, sendPrompt, report, runStore = automationRunStore, graphStore = automationGraphStore, archiveStore = automationArchiveStore }) {
    this.settingsStore = settingsStore;
    this.getSettings = getSettings;
    this.sendPrompt = sendPrompt;
    this.report = report || (() => {});
    this.runStore = runStore;
    this.graphStore = graphStore;
    this.archiveStore = archiveStore;
    this.busy = new Set();
  }

  resumeActiveRuns() {
    const settings = this.getSettings();
    if (!settings.enabled) return this.report("automation off");
    const active = this.runStore.list().filter(run => !["done", "error", "off"].includes(run.status));
    if (!active.length) return this.report("automation armed");
    for (const run of active) this.afterAssistantReply(run.lastReply || "", { conversationId: run.conversationId, resumed: true, allowEmpty:true });
    this.report(`automation resumed ${active.length} run${active.length === 1 ? "" : "s"}`);
  }

  reset(conversationId = null) {
    if (conversationId) this.runStore.remove(conversationId);
    else this.runStore.resetAll();
    this.report(conversationId ? `automation reset for ${conversationId}` : "automation reset");
  }

  onSettingsChanged(settings = {}) {
    const conversationId = getCurrentConversationId();
    if (!settings.enabled) return this.report("automation off");
    this.report("automation armed");
    if (conversationId) {
      this.runStore.remove(conversationId);
      this.afterAssistantReply("", { conversationId, manualKick: true, allowEmpty:true });
    }
  }

  async afterAssistantReply(replyText = "", context = {}) {
    const conversationId = context.conversationId || getCurrentConversationId();
    if (!conversationId) return this.report("automation waiting for conversation id");
    const settings = this.getSettings();
    if (!settings.enabled) return this.mark(conversationId, { status: "off", pendingTurn: 0 }, "automation off");
    const source = context.resumed ? "resume" : context.completionPhase ? context.completionPhase : "live";
    if (context.completionPhase !== "post-settle") await this.archiveStore.add({ conversationId, role: "assistant", text: replyText, source });
    if (this.busy.has(conversationId)) return this.report(`automation already sending for ${conversationId}`);
    const run = this.runStore.get(conversationId) || { conversationId, turns: 0, lastReply: "" };
    const committedTurns = Number(run.turns || 0);
    if (committedTurns >= Number(settings.maxTurns || 0)) return this.mark(conversationId, { status: "done", pendingTurn: 0 }, "automation complete");

    this.busy.add(conversationId);
    const nextTurn = committedTurns + 1;
    this.mark(conversationId, { status: "waiting", pendingTurn: nextTurn, turns: committedTurns, lastReply: replyText }, `automation waiting · ${nextTurn}/${settings.maxTurns}`);
    await sleep(Number(settings.delayMs || 0));
    let assistantReply = "";
    try {
      const graph = this.graphStore.load();
      const memory = run.memory || {};
      const graphStart = run.graphNode || graph.start;
      const decision = evaluateAutomationGraph({ ...graph, start: graphStart }, { lastReply: replyText, conversationId, turn: nextTurn, settings, memory });
      if (decision.stop) return this.mark(conversationId, { status: "done", turns: committedTurns, pendingTurn: 0, lastReply: replyText }, decision.reason || "automation complete");
      if (decision.archiveTag) await this.archiveStore.add({ conversationId, role: "assistant", text: replyText, source: "graph", tag: decision.archiveTag });
      if (Number(decision.delayMs || 0) > 0) await sleep(Number(decision.delayMs));
      const prompt = decision.prompt || settings.prompt || "continue";
      this.mark(conversationId, { status: "sending", turns: committedTurns, pendingTurn: nextTurn, lastReply: replyText, lastGraphNode: decision.nodeId || null }, `automation sending · ${nextTurn}/${settings.maxTurns}`);
      assistantReply = await this.sendPrompt(prompt, { conversationId, automation: true, graphNode: decision.nodeId || null, role: decision.role || "", instructions: decision.instructions || "" });
      const finalReply = String(assistantReply || "").trim() ? assistantReply : replyText;
      const nextMemory = { ...memory, [decision.outputKey || "lastReply"]: finalReply };
      this.mark(conversationId, { status: "completed-turn", turns: nextTurn, pendingTurn: 0, lastReply: finalReply, lastPrompt: prompt, graphNode: decision.next || graph.start, memory: nextMemory }, `automation committed · ${nextTurn}/${settings.maxTurns}`);
    } catch (error) {
      this.mark(conversationId, { status: "error", turns: committedTurns, pendingTurn: 0, error: error.message || String(error) }, `automation error: ${error.message || error}`);
      if (settings.stopOnError) this.settingsStore.save({ enabled: false });
      return;
    } finally {
      this.busy.delete(conversationId);
    }

    const continuationReply = typeof assistantReply === "string" ? (assistantReply.trim() || replyText || promptSummaryFromRun(this.runStore.get(conversationId))) : "";
    const freshSettings = this.getSettings();
    if (automationContinuationGate.canSchedule({ conversationId, replyText: continuationReply, settings: freshSettings, context:{ ...context, allowEmpty:true }, turns: nextTurn })) {
      this.mark(conversationId, { status: "waiting", turns: nextTurn, pendingTurn: nextTurn + 1, lastReply: continuationReply }, `automation waiting · next ${nextTurn + 1}/${freshSettings.maxTurns}`);
      this.mark(conversationId, { status: "armed", turns: nextTurn, pendingTurn: 0, lastReply: continuationReply }, "automation next turn armed");
      setTimeout(() => this.afterAssistantReply(continuationReply, { conversationId, allowEmpty:true, completionPhase: "post-settle" }), 0);
      return;
    }
    this.mark(conversationId, { status: "done", turns: nextTurn, pendingTurn: 0, lastReply: continuationReply }, "automation complete");
  }

  mark(conversationId, patch, message = "") {
    this.runStore.patch(conversationId, patch);
    if (message) this.report(message);
  }
}

function getCurrentConversationId() {
  try { return new URLSearchParams(location.search).get("awtsmoosConversation") || window.curConversationId || null; }
  catch { return null; }
}

function promptSummaryFromRun(run = {}) { return String(run.lastReply || run.lastPrompt || "").trim(); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
