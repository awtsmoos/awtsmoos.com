//B"H
import { classifyTransportEvent } from "./messageNormalizer.js";
import { MessageVault } from "./messageVault.js";
import { prepareRecords } from "./workerClient.js";
import { WINDOW } from "./runtime/renderConstants.js";
import { button, clamp, mergeEvents } from "./runtime/renderHelpers.js";
import { refreshEventsLive, visibleRenderableEvents } from "./runtime/eventRuntime.js";
import { applyPacket, makeRecord, snapshotRecord } from "./runtime/recordRuntime.js";
import { createCombinedBubble, createShell, refreshEventBadge, updateBubbleHtml } from "./runtime/shellRuntime.js";
import { removeIfEmptyLoading } from "./runtime/loadingRuntime.js";
import { sweepLoadingGhosts } from "./runtime/loadingSweep.js";
import { bottomWeightedStart, pruneTopRenderedShells, shiftWeightedWindow, syncWindowGates, weightedEnd } from "./runtime/windowRuntime.js";
import { clearLoadState, showLoadState } from "./runtime/loadState.js";
import { isNearBottom, isProgrammaticScroll, scrollToLiveBottom } from "./runtime/scrollRuntime.js";
import { finalizeTextRecord } from "./runtime/liveTextRuntime.js";

/**
 * Chapter 54: The Renderer Became A Court Of Living Actors.
 *
 * Records enter as loading sparks, mutate as stream actors, and freeze into
 * markdown history when the turn completes. Scroll follows only while invited,
 * and duplicate event listeners never multiply unseen claws in the dark.
 */
export class MessageRenderer {
  constructor({ chatBox }) {
    this.chatBox = chatBox;
    this.vault = new MessageVault();
    this.records = [];
    this.byId = new Map();
    this.windowStart = 0;
    this.renderSeq = 0;
    this.userPinnedScroll = false;
    this.lastScrollTop = 0;
    this.chatBox.dataset.liveFollow = "active";
    this.topSpacer = button("message-window-spacer top");
    this.bottomSpacer = button("message-window-spacer bottom");
    this.bottomSentinel = document.createElement("div");
    this.bottomSentinel.className = "chat-bottom-sentinel";
    this.liveFollowButton = document.createElement("button");
    this.liveFollowButton.type = "button";
    this.liveFollowButton.className = "live-follow-button";
    this.liveFollowButton.textContent = "↓ Jump to bottom";
    this.liveFollowButton.onclick = () => this.forceScrollDown();
    this.topSpacer.onclick = () => !this.topSpacer.disabled && this.shiftWindow(-WINDOW);
    this.bottomSpacer.onclick = () => !this.bottomSpacer.disabled && this.shiftWindow(WINDOW);
    this.chatBox.parentElement?.append?.(this.liveFollowButton);
    chatBox.addEventListener("wheel", event => this.trackWheelIntent(event), { passive: true });
    chatBox.addEventListener("touchstart", event => this.trackTouchStart(event), { passive: true });
    chatBox.addEventListener("touchmove", event => this.trackTouchMove(event), { passive: true });
    chatBox.addEventListener("scroll", () => this.trackScrollIntent(), { passive: true });
    this.renderWindow({ bottom: true });
  }

  clear() {
    this.purgeHotDom();
    this.records = [];
    this.byId.clear();
    this.userPinnedScroll = false;
    this.lastScrollTop = 0;
    this.chatBox.dataset.liveFollow = "active";
    this.liveFollowButton?.classList?.remove?.("is-visible");
    this.chatBox.innerHTML = "";
    this.renderWindow({ bottom: true });
  }

  /**
   * B"H — tears old visible vessels out of RAM before another chat opens.
   *
   * DOM nodes, pending render flags, and hot vault rows are only for the current
   * visible chat. The durable vault may keep cold snapshots, but switching chats
   * must release attached shells immediately so hidden streams cannot keep a
   * whole forest of thought panels breathing in memory.
   */
  purgeHotDom() {
    for (const record of this.records) {
      record.shell = null;
      record.bubble = null;
      record.renderedEventNodes = null;
      record.refreshQueued = false;
    }
    this.vault?.purgeMemory?.();
  }

  add(input, { deferRender = false } = {}) {
    const record = makeRecord(input);
    this.records.push(record);
    this.byId.set(record.id, record);
    this.vault.put(record.id, snapshotRecord(record));
    if (!deferRender) this.appendLiveRecord(record);
    return { shell: record.shell, bubble: record.bubble || null, message: record.message, id: record.id };
  }

  async loadMessages(inputs = []) {
    this.clear();
    showLoadState(this.chatBox, "Loading conversation sparks…");
    try {
      for (const input of inputs) {
        const record = this.add(input, { deferRender: true });
        this.finalizeHistoricalRecord(record.id);
      }
      await this.renderWindow({ bottom: true });
    } catch (error) {
      showLoadState(this.chatBox, `Conversation load failed: ${error?.message || error}`, "error");
      throw error;
    } finally {
      clearLoadState(this.chatBox);
      this.forceScrollDown();
      this.forceScrollDownSoon();
    }
  }

  async updateRecord(id, input, role = "assistant") {
    const record = this.byId.get(id);
    if (!record) return;
    applyPacket(record, input, role);
    await this.vault.put(record.id, snapshotRecord(record));
    this.refreshLive(record);
    if (record.text) sweepLoadingGhosts(this);
    this.scrollDown();
  }

  setRecordEvents(id, events = []) {
    const record = this.byId.get(id);
    if (!record) return;
    record.events = mergeEvents(record.events, events);
    const hasVisibleEvents = visibleRenderableEvents(record.events).length > 0;
    if (record.text || hasVisibleEvents) {
      record.loading = false;
      record.shell?.querySelector?.(":scope > .message.is-loading")?.remove();
    }
    refreshEventBadge(record);
    refreshEventsLive(this, record);
  }

  async renderWindow({ bottom = false } = {}) {
    const seq = ++this.renderSeq;
    if (bottom) this.windowStart = bottomWeightedStart(this.records);
    const end = weightedEnd(this.records, this.windowStart);
    const slice = this.records.slice(this.windowStart, end);
    await this.prepareSlice(slice);
    if (seq !== this.renderSeq) return;
    this.chatBox.innerHTML = "";
    syncWindowGates(this, end);
    this.chatBox.append(this.topSpacer);
    for (const record of slice) {
      const shell = createShell(this, record);
      if (!shell.classList.contains("is-render-suppressed")) this.chatBox.append(shell);
    }
    this.chatBox.append(this.bottomSpacer, this.bottomSentinel);
  }

  async prepareSlice(slice) {
    const missing = slice.filter(record => !record.prepared && record.text);
    if (!missing.length) return;
    const payload = missing.map(({ id, role, text, events, raw }) => ({ id, role, text, events, raw }));
    for (const prep of await prepareRecords(payload)) {
      const record = this.byId.get(prep.id);
      if (record) record.prepared = prep;
    }
  }

  appendLiveRecord(record) {
    if (!this.bottomSpacer.isConnected) return this.renderWindow({ bottom: true });
    this.chatBox.insertBefore(createShell(this, record), this.bottomSpacer);
    pruneTopRenderedShells(this);
    this.scrollDown();
  }

  refreshLive(record) {
    if (!record.shell || !record.shell.isConnected) return this.appendLiveRecord(record);
    if (record.refreshQueued) return;
    record.refreshQueued = true;
    const schedule = globalThis.requestAnimationFrame || (callback => setTimeout(callback, 16));
    schedule(() => {
      record.refreshQueued = false;
      this.performLiveRefresh(record);
    });
  }

  performLiveRefresh(record) {
    if (!record.shell || !record.shell.isConnected) return this.appendLiveRecord(record);
    record.shell.classList.toggle("is-live", Boolean(record.streaming || record.loading));
    record.shell.classList.toggle("is-finished", !record.streaming && !record.loading);
    record.shell.querySelector?.(":scope > .message.is-loading")?.remove();
    if (!record.bubble && record.text) record.shell.append(createCombinedBubble(this, record));
    updateBubbleHtml(this, record);
    refreshEventsLive(this, record);
  }

  finalizeHistoricalRecord(id) {
    const record = this.byId.get(id);
    if (!record) return;
    finalizeTextRecord(record);
    record.loading = false;
    record.streaming = false;
  }

  finalizeLiveRecords() {
    for (const record of this.records) {
      if (!record.streaming && !record.loading) continue;
      finalizeTextRecord(record);
      record.loading = false;
      record.streaming = false;
      record.shell?.querySelector?.(":scope > .message.is-loading")?.remove();
      record.bubble?.classList?.remove?.("is-streaming-markdown", "has-pending-markdown-freeze");
      if (record.bubble?.dataset) delete record.bubble.dataset.pendingMarkdownHtml;
      refreshEventBadge(record);
      this.performLiveRefresh(record);
    }
    this.removeLoadingRecords();
  }

  pushTransport(shell, event) {
    const id = shell?.dataset?.messageId || shell?.closest?.(".message-shell")?.dataset?.messageId;
    const record = this.byId.get(id);
    if (!record) return;
    record.events = mergeEvents(record.events, [classifyTransportEvent(event)].filter(Boolean));
    refreshEventsLive(this, record);
  }

  showError(title, error, raw = null) {
    const text = `${title}\n\n${error?.message || error || "Unknown error"}${raw ? "\n\n" + raw : ""}`;
    showLoadState(this.chatBox, text, "error");
    return this.add({ message: { author: { role: "assistant" }, content: { parts: [text] } } });
  }

  lastUserText() {
    return [...this.records].reverse().find(record => record.role === "user" && record.text)?.text || "";
  }

  removeLoadingRecords() {
    this.records = this.records.filter(record => !removeIfEmptyLoading(this, record));
  }

  shiftWindow(delta) {
    this.windowStart = clamp(shiftWeightedWindow(this.records, this.windowStart, delta), 0, Math.max(0, this.records.length - 1));
    this.renderWindow();
  }

  forceScrollDown() {
    this.userPinnedScroll = false;
    this.chatBox.dataset.liveFollow = "active";
    this.liveFollowButton?.classList?.remove?.("is-visible");
    this.chatBox.scrollTop = this.chatBox.scrollHeight;
    scrollToLiveBottom(this, { instant: true, force: true });
  }

  forceScrollDownSoon() {
    const schedule = globalThis.requestAnimationFrame || (callback => setTimeout(callback, 16));
    schedule(() => {
      this.forceScrollDown();
      setTimeout(() => this.forceScrollDown(), 80);
      setTimeout(() => this.forceScrollDown(), 240);
    });
  }

  trackWheelIntent(event) {
    if (event?.deltaY < 0 && this.chatBox.scrollTop > 0) {
      this.pauseLiveFollow();
      return;
    }
    if (event?.deltaY > 0 && isNearBottom(this.chatBox)) this.resumeLiveFollow();
  }

  /**
   * B"H — lets a human hand escape the streaming river.
   *
   * Any clear upward intention becomes stronger than automatic follow. The page
   * stops pulling the reader downward until they explicitly jump back, like a
   * vessel refusing to spill one letter of the Awtsmoos while inspection burns.
   *
   * @returns {void}
   */
  pauseLiveFollow() {
    this.userPinnedScroll = true;
    this.chatBox.dataset.liveFollow = "paused";
    this.liveFollowButton?.classList?.add?.("is-visible");
  }

  resumeLiveFollow() {
    this.userPinnedScroll = false;
    this.chatBox.dataset.liveFollow = "active";
    this.liveFollowButton?.classList?.remove?.("is-visible");
  }

  trackTouchStart(event) {
    this.touchStartY = event?.touches?.[0]?.clientY ?? 0;
    this.touchStartScrollTop = this.chatBox.scrollTop;
  }

  trackTouchMove(event) {
    const y = event?.touches?.[0]?.clientY ?? this.touchStartY;
    if (y > this.touchStartY + 8 && !isNearBottom(this.chatBox)) {
      this.pauseLiveFollow();
    }
    this.trackScrollIntent();
  }

  trackScrollIntent() {
    if (isProgrammaticScroll(this.chatBox)) {
      this.lastScrollTop = this.chatBox.scrollTop;
      return;
    }
    const current = this.chatBox.scrollTop;
    const movedUp = current < this.lastScrollTop - 8;
    this.lastScrollTop = current;
    if (isNearBottom(this.chatBox)) {
      this.resumeLiveFollow();
      return;
    }
    if (movedUp) {
      this.pauseLiveFollow();
    }
  }

  scrollDown() {
    scrollToLiveBottom(this);
  }
}
