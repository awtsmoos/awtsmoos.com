//B"H
import { visibleRenderableEvents } from "./eventRuntime.js";

/**
 * Chapter 14: The False Spark Went Out.
 *
 * When the final assistant vessel arrives, old loading embers must not keep
 * glowing. Hidden-only transport residue may remain in the record, but if no
 * visible text or visible event was born, the loading shell vanishes.
 *
 * @param {{records:Array,byId:Map}} renderer Message renderer instance.
 * @returns {number} Number of removed loading ghosts.
 */
export function sweepLoadingGhosts(renderer) {
  let removed = 0;
  renderer.records = renderer.records.filter(record => {
    const ghost = record.loading && !record.text && !visibleRenderableEvents(record.events || []).length;
    if (!ghost) return true;
    record.shell?.remove();
    renderer.byId.delete(record.id);
    removed++;
    return false;
  });
  return removed;
}
