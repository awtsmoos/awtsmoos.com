//B"H
import { automationRunStore } from "./runStore.js";
import { automationGraphStore } from "./graphStore.js";
import { evaluateAutomationGraph } from "./graphEngine.js";
import { automationArchiveStore } from "./messageArchive.js";

/**
 * Guarded multi-conversation automation loop.
 *
 * Each chat owns its own run state. A visible page can keep many hidden chats
 * moving because continuation prompts are sent back to the original
 * conversation id instead of borrowing global UI state.
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
    const active = this.runStore.list().filter(run => !["done", "stopped", "error", "off"].includes(run.status));
    if (!active.length) return this.report("automation armed");
    for (const run of active) this.afterAssistantReply(run.lastReply || "", { conversationId: run.conversationId, resumed: true });
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
    if (conversationId) this.afterAssistantReply("", { conversationId, manualKick: true });
  }

  async afterAssistantReply(replyText = "", context = {}) {
    const conversationId = context.conversationId || getCurrentConversationId();
    if (!conversationId) return this.report("automation waiting for conversation id");
    const settings = this.getSettings();
    if (!settings.enabled) return this.mark(conversationId, { status: "off" }, "automation off");
    await this.archiveStore.add({ conversationId, role: "assistant", text: replyText, source: context.resumed ? "resume" : "live" });
    if (this.busy.has(conversationId)) return this.report(`automation busy guard held for ${conversationId}`);
    const run = this.runStore.get(conversationId) || { conversationId, turns: 0, lastReply: "" };
    if (run.turns >= Number(settings.maxTurns || 0)) return this.mark(conversationId, { status: "done" }, "max turns reached");
    if (this.isRepeating(replyText, run.lastReply)) return this.mark(conversationId, { status: "stopped", lastReply: replyText }, "loop guard stopped repeated reply");
    this.busy.add(conversationId);
    const nextTurn = Number(run.turns || 0) + 1;
    this.mark(conversationId, { status: "waiting", turns: nextTurn, lastReply: replyText }, `automation turn ${nextTurn}/${settings.maxTurns}`);
    await sleep(Number(settings.delayMs || 0));
    let assistantReply = "";
    try {
      const graph = this.graphStore.load();
      const memory = run.memory || {};
      const graphStart = run.graphNode || graph.start;
      const decision = evaluateAutomationGraph({ ...graph, start: graphStart }, { lastReply: replyText, conversationId, turn: nextTurn, settings, memory });
      if (decision.stop) return this.mark(conversationId, { status: "stopped", turns: nextTurn, lastReply: replyText }, decision.reason || "graph stopped automation");
      if (decision.archiveTag) await this.archiveStore.add({ conversationId, role: "assistant", text: replyText, source: "graph", tag: decision.archiveTag });
      if (Number(decision.delayMs || 0) > 0) await sleep(Number(decision.delayMs));
      const prompt = decision.prompt || settings.prompt || "continue";
      this.mark(conversationId, { status: "sending", turns: nextTurn, lastReply: replyText, lastGraphNode: decision.nodeId || null });
      assistantReply = await this.sendPrompt(prompt, { conversationId, automation: true, graphNode: decision.nodeId || null, role: decision.role || "", instructions: decision.instructions || "" });
      const nextMemory = { ...memory, [decision.outputKey || "lastReply"]: assistantReply || replyText };
      this.mark(conversationId, { status: "streaming", turns: nextTurn, lastReply: assistantReply || replyText, lastPrompt: prompt, graphNode: decision.next || graph.start, memory: nextMemory });
    } catch (error) {
      this.mark(conversationId, { status: "error", error: error.message || String(error) }, `automation error: ${error.message || error}`);
      if (settings.stopOnError) this.settingsStore.save({ enabled: false });
    } finally {
      this.busy.delete(conversationId);
    }
    if (typeof assistantReply === "string" && assistantReply.trim() && this.getSettings().enabled) setTimeout(() => this.afterAssistantReply(assistantReply, { conversationId }), 0);
  }

  mark(conversationId, patch, message = "") {
    this.runStore.patch(conversationId, patch);
    if (message) this.report(message);
  }

  isRepeating(next, previous) {
    const a = String(next || "").trim().slice(-500);
    const b = String(previous || "").trim().slice(-500);
    return Boolean(a && b && a === b);
  }
}

function getCurrentConversationId() {
  try { return new URLSearchParams(location.search).get("awtsmoosConversation") || window.curConversationId || null; }
  catch { return null; }
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
