//B"H
import { classifyTransportEvent } from "./messageNormalizer.js";
import { MessageVault } from "./messageVault.js";
import { prepareRecords } from "./workerClient.js";
import { WINDOW, BUFFER } from "./runtime/renderConstants.js";
import { button, clamp, mergeEvents } from "./runtime/renderHelpers.js";
import { refreshEventsLive } from "./runtime/eventRuntime.js";
import { applyPacket, makeRecord, snapshotRecord } from "./runtime/recordRuntime.js";
import { createCombinedBubble, createShell, updateBubbleHtml } from "./runtime/shellRuntime.js";
import { pruneTopRenderedShells, syncWindowGates } from "./runtime/windowRuntime.js";

export class MessageRenderer {
  constructor({ chatBox }) {
    this.chatBox = chatBox;
    this.vault = new MessageVault();
    this.records = [];
    this.byId = new Map();
    this.windowStart = 0;
    this.renderSeq = 0;
    this.userPinnedScroll = false;
    this.programmaticScroll = false;
    this.topSpacer = button("message-window-spacer top");
    this.bottomSpacer = button("message-window-spacer bottom");
    this.bottomSentinel = document.createElement("div");
    this.bottomSentinel.className = "chat-bottom-sentinel";
    this.topSpacer.onclick = () => !this.topSpacer.disabled && this.shiftWindow(-WINDOW);
    this.bottomSpacer.onclick = () => !this.bottomSpacer.disabled && this.shiftWindow(WINDOW);
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
    for (const input of inputs) this.add(input, { deferRender: true });
    await this.renderWindow({ bottom: true });
    this.forceScrollDown();
  }

  async updateRecord(id, input, role = "assistant") {
    const record = this.byId.get(id);
    if (!record) return;
    applyPacket(record, input, role);
    await this.vault.put(record.id, snapshotRecord(record));
    this.refreshLive(record);
    this.scrollDown();
  }

  setRecordEvents(id, events = []) {
    const record = this.byId.get(id);
    if (!record) return;
    record.events = mergeEvents(record.events, events);
    refreshEventsLive(this, record);
  }

  async renderWindow({ bottom = false } = {}) {
    const seq = ++this.renderSeq;
    if (bottom) this.windowStart = Math.max(0, this.records.length - WINDOW);
    const end = Math.min(this.records.length, this.windowStart + WINDOW + BUFFER);
    const slice = this.records.slice(this.windowStart, end);
    await this.prepareSlice(slice);
    if (seq !== this.renderSeq) return;
    this.chatBox.innerHTML = "";
    syncWindowGates(this, end);
    this.chatBox.append(this.topSpacer);
    for (const record of slice) this.chatBox.append(createShell(this, record));
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
    if (!record.bubble && record.text) record.shell.prepend(createCombinedBubble(this, record));
    updateBubbleHtml(this, record);
    refreshEventsLive(this, record);
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
    return this.add({ message: { author: { role: "assistant" }, content: { parts: [text] } } });
  }

  lastUserText() { return [...this.records].reverse().find(record => record.role === "user" && record.text)?.text || ""; }
  removeLoadingRecords() { this.records = this.records.filter(record => !removeIfLoading(this, record)); }
  shiftWindow(delta) { this.windowStart = clamp(this.windowStart + delta, 0, Math.max(0, this.records.length - WINDOW)); this.renderWindow(); }
  forceScrollDown() { this.userPinnedScroll = false; this.scrollDown(); }
  trackScrollIntent() { if (!this.programmaticScroll) this.userPinnedScroll = this.chatBox.scrollHeight - this.chatBox.scrollTop - this.chatBox.clientHeight > 80; }
  scrollDown() { if (!this.userPinnedScroll) requestAnimationFrame(() => this.bottomSentinel.scrollIntoView({ block: "end" })); }
}

function removeIfLoading(renderer, record) {
  if (!record.loading) return false;
  record.shell?.remove();
  renderer.byId.delete(record.id);
  return true;
}
