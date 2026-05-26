//B"H
import { automationRunStore } from "./runStore.js";

/**
 * Guarded multi-conversation automation loop.
 *
 * Each chat owns its own run state. A visible page can keep many hidden chats
 * moving because continuation prompts are sent back to the original
 * conversation id instead of borrowing global UI state.
 */
export class AutomationPipeline {
  constructor({ settingsStore, getSettings, sendPrompt, report, runStore = automationRunStore }) {
    this.settingsStore = settingsStore;
    this.getSettings = getSettings;
    this.sendPrompt = sendPrompt;
    this.report = report || (() => {});
    this.runStore = runStore;
    this.busy = new Set();
  }

  reset(conversationId = null) {
    if (conversationId) this.runStore.remove(conversationId);
    else this.runStore.resetAll();
    this.report(conversationId ? `automation reset for ${conversationId}` : "automation reset");
  }

  async afterAssistantReply(replyText = "", context = {}) {
    const conversationId = context.conversationId || getCurrentConversationId();
    if (!conversationId) return this.report("automation waiting for conversation id");
    const settings = this.getSettings();
    if (!settings.enabled) return this.mark(conversationId, { status: "off" }, "automation off");
    if (this.busy.has(conversationId)) return this.report(`automation busy guard held for ${conversationId}`);
    const run = this.runStore.get(conversationId) || { conversationId, turns: 0, lastReply: "" };
    if (run.turns >= Number(settings.maxTurns || 0)) return this.mark(conversationId, { status: "done" }, "max turns reached");
    if (this.isRepeating(replyText, run.lastReply)) return this.mark(conversationId, { status: "stopped", lastReply: replyText }, "loop guard stopped repeated reply");
    this.busy.add(conversationId);
    const nextTurn = Number(run.turns || 0) + 1;
    this.mark(conversationId, { status: "waiting", turns: nextTurn, lastReply: replyText }, `automation turn ${nextTurn}/${settings.maxTurns}`);
    await sleep(Number(settings.delayMs || 0));
    try {
      this.mark(conversationId, { status: "sending", turns: nextTurn, lastReply: replyText });
      await this.sendPrompt(settings.prompt || "continue", { conversationId, automation: true });
      this.mark(conversationId, { status: "streaming", turns: nextTurn, lastReply: replyText });
    } catch (error) {
      this.mark(conversationId, { status: "error", error: error.message || String(error) }, `automation error: ${error.message || error}`);
      if (settings.stopOnError) this.settingsStore.save({ enabled: false });
    } finally {
      this.busy.delete(conversationId);
    }
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
