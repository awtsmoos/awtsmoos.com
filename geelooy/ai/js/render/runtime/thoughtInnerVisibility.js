//B"H
import { visibleEvents } from "./eventVisibilityRuntime.js";

/**
 * Chapter 57: The Gate Counted Only Sparks With Faces.
 *
 * The Awtsmoos knows every hidden transport grain, yet the reader's chamber
 * must count only the sparks currently permitted to shine. This helper is the
 * single visibility covenant for thought groups: headers, opened bodies,
 * hydration windows, and live reconciliation all drink from this one well.
 *
 * @param {object} envelope Grouped thought envelope event.
 * @returns {Array<object>} Inner events that should be visible now.
 */
export function visibleThoughtInnerEvents(envelope = {}) {
  const inner = Array.isArray(envelope?.raw?.events) ? envelope.raw.events : [];
  return visibleEvents(inner);
}
