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
import { isNearBottom, scrollToLiveBottom } from "./runtime/scrollRuntime.js";
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
    this.topSpacer = button("message-window-spacer top");
    this.bottomSpacer = button("message-window-spacer bottom");
    this.bottomSentinel = document.createElement("div");
    this.bottomSentinel.className = "chat-bottom-sentinel";
    this.topSpacer.onclick = () => !this.topSpacer.disabled && this.shiftWindow(-WINDOW);
    this.bottomSpacer.onclick = () => !this.bottomSpacer.disabled && this.shiftWindow(WINDOW);
    chatBox.addEventListener("wheel", event => this.trackWheelIntent(event), { passive: true });
    chatBox.addEventListener("touchmove", () => this.trackScrollIntent(), { passive: true });
    chatBox.addEventListener("scroll", () => this.trackScrollIntent(), { passive: true });
    this.renderWindow({ bottom: true });
  }

  clear() {
    this.records = [];
    this.byId.clear();
    this.chatBox.innerHTML = "";
    this.renderWindow({ bottom: true });
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
      for (const input of inputs) this.add(input, { deferRender: true });
      await this.renderWindow({ bottom: true });
      this.forceScrollDown();
    } catch (error) {
      showLoadState(this.chatBox, `Conversation load failed: ${error?.message || error}`, "error");
      throw error;
    } finally {
      clearLoadState(this.chatBox);
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
    record.shell.querySelector?.(":scope > .message.is-loading")?.remove();
    if (!record.bubble && record.text) record.shell.append(createCombinedBubble(this, record));
    updateBubbleHtml(this, record);
    refreshEventsLive(this, record);
  }

  finalizeLiveRecords() {
    for (const record of this.records) {
      if (!record.streaming && !record.loading) continue;
      finalizeTextRecord(record);
      record.loading = false;
      record.shell?.querySelector?.(":scope > .message.is-loading")?.remove();
      this.refreshLive(record);
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
    this.chatBox.scrollTop = this.chatBox.scrollHeight;
    scrollToLiveBottom(this, { instant: true, force: true });
  }

  trackWheelIntent(event) {
    if (event?.deltaY < 0) this.userPinnedScroll = true;
    if (event?.deltaY > 0 && isNearBottom(this.chatBox)) this.userPinnedScroll = false;
  }

  trackScrollIntent() {
    this.userPinnedScroll = !isNearBottom(this.chatBox);
  }

  scrollDown() {
    scrollToLiveBottom(this);
  }
}
