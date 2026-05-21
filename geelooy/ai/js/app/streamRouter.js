//B"H
import { normalizeMessage } from "../render/messageNormalizer.js";
import { isDonePacket, looksLikeUserEcho } from "./stream/packetState.js";
import { withoutFinalReplayEvents } from "./stream/livePacketSanitizer.js";

/**
 * Chapter 72: The Stream Did Not Repeat Its Own Footsteps.
 *
 * Live packets are routed as they arrive. The final response may contain an
 * archive of all prior streamed events; that archive belongs to history, not to
 * the live tail. Finish therefore removes replay-only archives before one last
 * text merge, then freezes the living records into stable markdown history.
 */
export class StreamRouter {
  constructor(renderer) {
    this.renderer = renderer;
    this.eventRecord = null;
    this.textRecord = null;
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
    if (hasEvents) this.renderer.setRecordEvents(this.ensureEventRecord().id, normalized.events);
    if (hasText && normalized.role === "assistant" && !looksLikeUserEcho(this.renderer, normalized.text)) {
      await this.renderer.updateRecord(this.ensureTextRecord().id, packet, "assistant");
    }
  }

  ensureEventRecord() {
    if (this.eventRecord && !this.eventRecord.shell?.classList?.contains("has-text")) return this.eventRecord;
    if (this.textRecord) return this.textRecord;
    this.eventRecord = this.renderer.add({ message: { author: { role: "assistant" }, content: { parts: [""] } }, awtsmoosLoading: true });
    this.assistant = this.eventRecord;
    return this.eventRecord;
  }

  ensureTextRecord() {
    if (this.textRecord) return this.textRecord;
    this.textRecord = this.renderer.add({ message: { author: { role: "assistant" }, content: { parts: [""] } }, awtsmoosLoading: true });
    this.assistant = this.textRecord;
    return this.textRecord;
  }

  finishDone() {
    if (this.done) return;
    this.done = true;
    this.renderer.finalizeLiveRecords?.();
  }
}
