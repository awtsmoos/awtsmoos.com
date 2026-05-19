//B"H
import { normalizeMessage } from "../render/messageNormalizer.js";
import { eventRecordKey } from "./stream/eventKeys.js";
import { isDonePacket, looksLikeUserEcho } from "./stream/packetState.js";

/**
 * B"H — Routes every stream packet without losing hidden vessels.
 *
 * Done packets are normalized before completion, because ChatGPT often hides
 * status/tool/thinking details inside the same final packet that says complete.
 */
export class StreamRouter {
  constructor(renderer) {
    this.renderer = renderer;
    this.records = new Map();
    this.assistant = null;
    this.done = false;
  }

  async route(packet) {
    const normalized = normalizeMessage(packet);
    const hasText = Boolean(normalized.text?.trim());
    const hasEvents = Boolean(normalized.events?.length);

    if (hasText && normalized.role === "assistant" && !looksLikeUserEcho(this.renderer, normalized.text)) {
      const target = this.ensureAssistant();
      await this.renderer.updateRecord(target.id, packet, "assistant");
    }

    if (hasEvents) for (const event of normalized.events) this.routeEvent(event);
    if (isDonePacket(packet)) this.finishDone();
  }

  async finish(packet) {
    await this.route(packet);
    this.finishDone();
  }

  ensureAssistant() {
    if (this.assistant) return this.assistant;
    this.assistant = this.renderer.add({
      message: { author: { role: "assistant" }, content: { parts: [""] } },
      awtsmoosLoading: true
    });
    return this.assistant;
  }

  routeEvent(event) {
    if (!event) return;
    const key = eventRecordKey(event);
    let record = this.records.get(key);
    if (!record) {
      record = this.renderer.add({
        message: { author: { role: "assistant" }, content: { parts: [""] } },
        awtsmoosStreamEvent: event
      });
      this.records.set(key, record);
    }
    this.renderer.setRecordEvents(record.id, [event]);
  }

  finishDone() {
    this.done = true;
    this.renderer.removeLoadingRecords?.();
  }
}
