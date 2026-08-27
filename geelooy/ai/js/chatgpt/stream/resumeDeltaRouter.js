//B"H
import { StreamRouter } from "../../app/streamRouter.js";

/**
 * Chapter 92: The DOM Was Fed With Needles Of Light.
 *
 * A delta is already purified by the worker. This router gives the renderer only
 * text and event capsules, preserving order while avoiding main-thread provider
 * normalization. The old StreamRouter remains as a tiny vessel factory/finalizer.
 */
export class ResumeDeltaRouter {
  constructor(renderer) {
    this.renderer = renderer;
    this.router = new StreamRouter(renderer);
    this.record = this.router.open();
    this.text = "";
  }

  /**
   * @param {object} delta Compact worker delta.
   * @returns {Promise<string>} Latest assistant text.
   */
  async route(delta = {}) {
    if (delta.kind === "text") return await this.routeText(delta.text || "");
    if (delta.kind === "event" && delta.event) this.renderer.setRecordEvents(this.record.id, [delta.event]);
    if (delta.kind === "done") await this.finish();
    return this.text;
  }

  async routeText(text) {
    this.text = mergeText(this.text, text);
    await this.renderer.updateRecord(this.record.id, { message: { author: { role: "assistant" }, content: { parts: [this.text] } } }, "assistant");
    return this.text;
  }

  async finish() {
    await this.router.finish({ dataNoJSON: "[DONE]" });
  }
}

function mergeText(previous = "", next = "") {
  if (!next) return previous;
  if (!previous || next.startsWith(previous)) return next;
  if (previous.startsWith(next) || previous.includes(next)) return previous;
  const overlap = longestSuffixPrefix(previous, next, 12000);
  return overlap ? previous + next.slice(overlap) : previous;
}

function longestSuffixPrefix(left, right, max) {
  const limit = Math.min(max, left.length, right.length);
  for (let size = limit; size > 0; size--) if (left.slice(-size) === right.slice(0, size)) return size;
  return 0;
}
