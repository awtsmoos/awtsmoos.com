//B"H
import { streamResumeStore } from "../chatgpt/stream/streamResumeStore.js";
import { automationRunStore } from "../automation/runStore.js";

/**
 * Chapter 1: The Sidebar Learned To See Rivers Not Yet In Its Page.
 *
 * A living stream may belong to a conversation outside the currently paged
 * history list. This helper reveals only living streams as transient rows; done
 * ghosts may remain briefly in storage for replay, but never pin "streaming" UI.
 *
 * @returns {Array<object>} Conversation-like live row records.
 */
export function liveConversationRows() {
  const byId = new Map();
  streamResumeStore.prune?.();
  for (const stream of streamResumeStore.active()) {
    const id = stream.conversationId || stream.surfaceConversationId;
    if (!id) continue;
    byId.set(id, {
      id,
      title: stream.title || `Streaming chat ${String(id).slice(0, 8)}`,
      awtsmoosLive: true,
      awtsmoosStreamStatus: stream.status || "streaming",
      updatedAt: stream.updatedAt || stream.createdAt || 0
    });
  }
  for (const run of automationRunStore.list()) {
    if (!run.conversationId || ["off", "done", "stopped", "error"].includes(run.status)) continue;
    const existing = byId.get(run.conversationId) || { id: run.conversationId, title: `Automation chat ${String(run.conversationId).slice(0, 8)}` };
    byId.set(run.conversationId, { ...existing, awtsmoosLive: true, awtsmoosAutomationStatus: run.status || "active", awtsmoosAutomationTurns: run.turns || 0, updatedAt: Math.max(existing.updatedAt || 0, run.updatedAt || 0) });
  }
  return [...byId.values()].sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
}

/**
 * Adds live rows that are absent from the current server-returned page.
 *
 * @param {HTMLUListElement} list Sidebar list.
 * @param {Array<object>} serverItems Conversation page records.
 * @param {(conversation:object) => HTMLElement} makeConversation Row factory.
 * @returns {number} Number of injected rows.
 */
export function prependMissingLiveRows(list, serverItems = [], makeConversation) {
  if (!list || typeof makeConversation !== "function") return 0;
  const serverIds = new Set(serverItems.map(item => item?.id).filter(Boolean));
  let count = 0;
  for (const row of liveConversationRows()) {
    if (serverIds.has(row.id) || list.querySelector?.(`[data-id="${cssEscape(row.id)}"]`)) continue;
    const node = makeConversation(row);
    node.classList.add("is-live-transient");
    list.prepend(node);
    count++;
  }
  return count;
}

function cssEscape(value = "") {
  if (globalThis.CSS?.escape) return CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
}
