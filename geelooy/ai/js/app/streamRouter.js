//B"H
import { normalizeMessage } from "../render/messageNormalizer.js";
import { visibleRenderableEvents } from "../render/runtime/eventRuntime.js";
import { isDonePacket, looksLikeUserEcho } from "./stream/packetState.js";
import { withoutFinalReplayEvents } from "./stream/livePacketSanitizer.js";

/**
 * Chapter 126: The Blank Assistant Was Judged And Released.
 *
 * The stream may carry hidden system packets, resume tokens, and status embers
 * before any real assistant words arrive. The Awtsmoos now refuses to leave a
 * dead empty bubble alive: only visible text or truly renderable event fire may
 * finish a turn; otherwise the user sees a clear transport failure.
 */
export class StreamRouter {
  constructor(renderer) {
    this.renderer = renderer;
    this.record = null;
    this.assistant = null;
    this.done = false;
    this.hasVisibleText = false;
    this.queue = Promise.resolve();
  }

  open() { return this.ensureAssistantRecord(); }
  route(packet) { this.queue = this.queue.then(() => this.routeNow(packet)).catch(error => this.fail(error)); return this.queue; }
  finish(packet) { this.queue = this.queue.then(() => this.finishNow(packet)).catch(error => this.fail(error)); return this.queue; }

  async routeNow(packet) {
    const normalized = normalizeMessage(packet);
    await this.routeNormalized(packet, normalized);
    if (isDonePacket(packet) && this.hasVisibleText) this.finishDone();
  }

  async finishNow(packet) {
    if (packet && !isDonePacket(packet)) {
      const safePacket = withoutFinalReplayEvents(packet);
      await this.routeNormalized(safePacket, normalizeMessage(safePacket));
    }
    if (this.hasVisibleText || this.hasRenderableEvents()) return this.finishDone();
    return this.abort(new Error("The provider finished without visible assistant text. The hidden/status packets were cleared instead of leaving a stuck blank response."));
  }

  async routeNormalized(packet, normalized) {
    const record = this.ensureAssistantRecord();
    if (normalized.events?.length) this.renderer.setRecordEvents(record.id, normalized.events);
    if (!isAssistantText(normalized)) return;
    if (looksLikeUserEcho(this.renderer, normalized.text)) return;
    this.hasVisibleText = true;
    await this.renderer.updateRecord(record.id, packet, "assistant");
  }

  ensureAssistantRecord() {
    if (this.record) return this.record;
    this.record = this.renderer.add({ message: { author: { role: "assistant" }, content: { parts: [""] } }, awtsmoosLoading: true });
    this.assistant = this.record;
    return this.record;
  }

  hasRenderableEvents() {
    return Boolean(visibleRenderableEvents(this.record?.events || []).length);
  }

  abort(error) {
    const record = this.ensureAssistantRecord();
    record.text = friendlyStreamError(error);
    record.events = [];
    record.loading = false;
    record.streaming = false;
    this.renderer.refreshLive?.(record);
    this.renderer.finalizeLiveRecords?.();
    this.done = true;
  }

  finishDone() {
    if (this.done) return;
    this.done = true;
    this.renderer.finalizeLiveRecords?.();
  }

  fail(error) {
    console.warn("Stream router failed", error);
    this.abort(error);
  }
}

function isAssistantText(normalized = {}) {
  return normalized.role === "assistant" && String(normalized.text || "").trim();
}

function friendlyStreamError(error) {
  const message = String(error?.message || error || "Unknown stream error");
  if (/timed out|timeout/i.test(message)) return "The stream timed out before a final answer arrived. Try sending again; the stale streaming state has been cleared.";
  return `The stream stopped before completion. ${message}`;
}
