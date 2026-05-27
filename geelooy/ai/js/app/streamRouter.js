//B"H
import { normalizeMessage } from "../render/messageNormalizer.js";
import { isDonePacket, looksLikeUserEcho } from "./stream/packetState.js";
import { withoutFinalReplayEvents } from "./stream/livePacketSanitizer.js";

/**
 * Chapter 75: The Final Answer Could Not Be Overtaken By Its Own Thunder.
 *
 * Stream callbacks can arrive like lightning: thought, tool, text, done. Browser
 * handlers do not promise that every async render finishes before the final
 * packet descends. This router therefore serializes every packet through one
 * queue, so the last visible assistant text lands in the same vessel after the
 * thought traces and before markdown freezes the record.
 */
export class StreamRouter {
  constructor(renderer) {
    this.renderer = renderer;
    this.record = null;
    this.assistant = null;
    this.done = false;
    this.queue = Promise.resolve();
  }

  route(packet) {
    this.queue = this.queue.then(() => this.routeNow(packet)).catch(error => this.fail(error));
    return this.queue;
  }

  async finish(packet) {
    this.queue = this.queue.then(() => this.finishNow(packet)).catch(error => this.fail(error));
    return this.queue;
  }

  async routeNow(packet) {
    const normalized = normalizeMessage(packet);
    await this.routeNormalized(packet, normalized);
    if (isDonePacket(packet)) this.finishDone();
  }

  async finishNow(packet) {
    if (packet && !isDonePacket(packet)) {
      const safePacket = withoutFinalReplayEvents(packet);
      const normalized = normalizeMessage(safePacket);
      await this.routeNormalized(safePacket, normalized);
    }
    this.finishDone();
  }

  async routeNormalized(packet, normalized) {
    const hasText = Boolean(normalized.text?.trim());
    const hasEvents = Boolean(normalized.events?.length);
    const record = this.ensureAssistantRecord();
    if (hasEvents) this.renderer.setRecordEvents(record.id, normalized.events);
    if (hasText && normalized.role === "assistant" && !looksLikeUserEcho(this.renderer, normalized.text)) {
      await this.renderer.updateRecord(record.id, packet, "assistant");
    }
  }

  ensureAssistantRecord() {
    if (this.record) return this.record;
    this.record = this.renderer.add({ message: { author: { role: "assistant" }, content: { parts: [""] } }, awtsmoosLoading: true });
    this.assistant = this.record;
    return this.record;
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

function friendlyStreamError(error) {
  const message = String(error?.message || error || "Unknown stream error");
  if (/timed out|timeout/i.test(message)) return "The stream timed out before a final answer arrived. Try sending again; the stale streaming state has been cleared.";
  return `The stream stopped before completion. ${message}`;
}
