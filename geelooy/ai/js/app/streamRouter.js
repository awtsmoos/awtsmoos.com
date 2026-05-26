//B"H
import { normalizeMessage } from "../render/messageNormalizer.js";
import { isDonePacket, looksLikeUserEcho } from "./stream/packetState.js";
import { withoutFinalReplayEvents } from "./stream/livePacketSanitizer.js";

/**
 * Chapter 72: One Assistant Vessel Held The Whole River.
 *
 * A streamed turn must never split into a trace record and then a later text
 * record. That split was the root of out-of-order bubbles, audio controls
 * appearing before/after the wrong message, and thought events seeming to jump
 * beyond the final answer. This router creates exactly one assistant record per
 * visible streamed turn, then mutates that same vessel for events and text.
 */
export class StreamRouter {
  constructor(renderer) {
    this.renderer = renderer;
    this.record = null;
    this.assistant = null;
    this.done = false;
  }

  async route(packet) {
    const normalized = normalizeMessage(packet);
    await this.routeNormalized(packet, normalized);
    if (isDonePacket(packet)) this.finishDone();
  }

  async finish(packet) {
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

  finishDone() {
    if (this.done) return;
    this.done = true;
    this.renderer.finalizeLiveRecords?.();
  }
}
