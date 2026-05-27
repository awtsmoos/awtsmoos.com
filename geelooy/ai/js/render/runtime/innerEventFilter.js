//B"H
import { hasUsefulInnerEventFire } from "./eventRenderableGate.js";

/**
 * Chapter 1: The Empty Husk Was Not Counted As A Soul.
 *
 * Thought chambers should count only useful inner sparks. Timeout notices,
 * stream-complete status packets, and blank transport husks are diagnostics for
 * the outer system, not a mysterious "1 inner event" for the reader to open.
 *
 * @param {Array<object>} inner Raw grouped inner events.
 * @returns {Array<object>} Events worth showing inside a thought chamber.
 */
export function usefulInnerEvents(inner = []) {
  return inner.filter(isUsefulInnerEvent);
}

function isUsefulInnerEvent(event = {}) {
  return hasUsefulInnerEventFire(event);
}
