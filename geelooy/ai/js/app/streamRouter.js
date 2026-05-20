//B"H
import { normalizeMessage } from "../render/messageNormalizer.js";
import { isDonePacket, looksLikeUserEcho } from "./stream/packetState.js";

/**
 * B"H — Routes every stream packet into one assistant vessel.
 *
 * Streaming order is sacred: user prompt, then the assistant's thought chamber,
 * then the final answer. So thought/tool/result packets no longer create side
 * records that can drift above the user or below the answer; they accumulate
 * on the live assistant record and reconcile in place.
 */
export class StreamRouter {
  constructor(renderer) {
    this.renderer = renderer;
    this.assistant = null;
    this.done = false;
  }

  async route(packet) {
    const normalized = normalizeMessage(packet);
    const hasText = Boolean(normalized.text?.trim());
    const hasEvents = Boolean(normalized.events?.length);
    const target = hasEvents || (hasText && normalized.role === "assistant") ? this.ensureAssistant() : null;

    if (hasEvents) this.renderer.setRecordEvents(target.id, normalized.events);
    if (hasText && normalized.role === "assistant" && !looksLikeUserEcho(this.renderer, normalized.text)) {
      await this.renderer.updateRecord(target.id, packet, "assistant");
    }
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

  finishDone() {
    this.done = true;
    this.renderer.removeLoadingRecords?.();
  }
}
