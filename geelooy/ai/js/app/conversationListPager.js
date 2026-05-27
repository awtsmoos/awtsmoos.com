//B"H
import { ACTIVE_STREAMS_EVENT, streamResumeStore, isLivingStream } from "../chatgpt/stream/streamResumeStore.js";
import { AUTOMATION_RUNS_EVENT, automationRunStore } from "../automation/runStore.js";
import { prependMissingLiveRows } from "./conversationSidebarLiveRows.js";

/**
 * B"H — A small sidebar vessel for conversation pagination.
 *
 * The list receives pulse badges for hidden live streams and automation runs,
 * but completed stream ghosts are pruned before paint so the sidebar cannot
 * claim "streaming" after the river has already rested.
 */
export class ConversationListPager {
  constructor({ controller, limit = 26 } = {}) {
    this.controller = controller;
    this.limit = limit;
    this.offset = 0;
    this.total = null;
    this.boundList = null;
    globalThis.addEventListener?.(ACTIVE_STREAMS_EVENT, () => this.refreshLiveRows());
    globalThis.addEventListener?.(AUTOMATION_RUNS_EVENT, () => this.refreshLiveRows());
  }

  async reset(list) { this.offset = 0; this.total = null; await this.render(list); }
  async previous(list) { this.offset = Math.max(0, this.offset - this.limit); await this.render(list); }
  async next(list) { this.offset += this.limit; await this.render(list); }

  async render(list) {
    this.boundList = list;
    const loadingGate = this.makeNotice("is-loading", "Loading conversations…");
    list.replaceChildren(loadingGate);
    const frozenTimer = setTimeout(() => {
      if (loadingGate.isConnected) loadingGate.textContent = "Still loading conversations… checking ChatGPT transport.";
    }, 3500);
    try {
      const response = await this.controller.loadConversationListWithRetries(list, { offset: this.offset, limit: this.limit });
    const items = Array.isArray(response?.items) ? response.items : [];
    if (Number.isFinite(response?.total)) this.total = response.total;
    list.replaceChildren();
    if (this.offset > 0) list.appendChild(this.makeGate("previous"));
    prependMissingLiveRows(list, items, conversation => this.makeConversation(conversation));
    for (const conversation of items) list.appendChild(this.makeConversation(conversation));
    if (!items.length) this.controller.renderEmptyList(list, response);
    if (this.hasNext(items)) list.appendChild(this.makeGate("next", items.length));
    this.applyBadges(list);
    } finally {
      clearTimeout(frozenTimer);
    }
  }

  refreshLiveRows() {
    if (!this.boundList) return;
    prependMissingLiveRows(this.boundList, [], conversation => this.makeConversation(conversation));
    this.applyBadges(this.boundList);
  }

  hasNext(items) {
    if (!items.length) return false;
    if (Number.isFinite(this.total)) return this.offset + items.length < this.total;
    return items.length >= this.limit;
  }

  makeNotice(className, text) {
    const li = document.createElement("li");
    li.className = className;
    li.textContent = text;
    return li;
  }

  makeGate(kind, count = this.limit) {
    const li = document.createElement("li");
    li.className = `conversation-page-gate is-${kind}`;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = kind === "previous" ? `Load previous ${this.limit} conversations` : `Load next ${count || this.limit} conversations`;
    button.onclick = () => kind === "previous" ? this.previous(li.parentElement) : this.next(li.parentElement);
    li.appendChild(button);
    return li;
  }

  makeConversation(conversation) {
    const li = document.createElement("li");
    const title = document.createElement("span");
    title.className = "conversation-title";
    title.textContent = conversation.title || conversation.id || "Untitled";
    li.appendChild(title);
    li.dataset.id = conversation.id;
    if (conversation.gizmo_id) li.dataset.gizmo = conversation.gizmo_id;
    li.onclick = () => this.controller.loadConversation(conversation.id);
    return li;
  }

  applyBadges(list = this.boundList) {
    if (!list) return;
    const activeStreams = new Map(streamResumeStore.list().filter(s => s.conversationId && isLivingStream(s)).map(s => [s.conversationId, s]));
    const activeRuns = new Map(automationRunStore.list().filter(run => run.conversationId && !["off", "done", "stopped", "error"].includes(run.status)).map(run => [run.conversationId, run]));
    list.querySelectorAll("li[data-id]").forEach(item => {
      const stream = activeStreams.get(item.dataset.id);
      const run = activeRuns.get(item.dataset.id);
      item.classList.toggle("is-streaming", Boolean(stream));
      item.classList.toggle("is-automating", Boolean(run));
      item.querySelectorAll(".conversation-stream-badge,.conversation-automation-badge").forEach(node => node.remove());
      if (stream) item.appendChild(makeBadge("conversation-stream-badge", "streaming", "This chat is still streaming in the background"));
      if (run) item.appendChild(makeBadge("conversation-automation-badge", `auto ${run.turns || 0}`, `Automation is ${run.status || "active"}`));
    });
  }
}

function makeBadge(className, text, title) {
  const badge = document.createElement("span");
  badge.className = className;
  badge.textContent = text;
  badge.title = title;
  return badge;
}
