//B"H
import { visibleRenderableEvents } from "./eventRuntime.js";

/**
 * B"H — Loading ghosts may vanish when no visible spark was born.
 *
 * Hidden transport traces are allowed to remain in memory for diagnosis, but
 * they must not pin a dead loading bubble after the stream has finished.
 *
 * @param {{byId:Map}} renderer Message renderer instance.
 * @param {object} record Candidate loading record.
 * @returns {boolean} True when the shell was removed.
 */
export function removeIfEmptyLoading(renderer, record) {
  const hasVisibleEvents = visibleRenderableEvents(record.events || []).length > 0;
  const stillStreaming = record.loading || record.streaming;
  if (stillStreaming || record.text || hasVisibleEvents || record.finalTextPending) return false;
  record.shell?.remove();
  renderer.byId.delete(record.id);
  return true;
}
