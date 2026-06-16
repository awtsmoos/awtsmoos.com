// B"H
/** @file CollectRuntime.js @description Strict item collection into bag plus mission objective progress. */
import { addBagItem } from "../inventory/BagRuntime.js";
import { progressActiveObjectives } from "../missions/MissionObjectiveRuntime.js";
export function collectItem(olam, itemOrId, options = {}) {
  const item = addBagItem(olam, itemOrId, options); if (!item) return false;
  progressActiveObjectives(olam, "collect", Number(options.amount || item.quantity || 1));
  progressActiveObjectives(olam, `collect:${item.id}`, Number(options.amount || item.quantity || 1));
  if (item.baseId) progressActiveObjectives(olam, `collect:${item.baseId}`, Number(options.amount || item.quantity || 1));
  olam?.ayshPeula?.("ui event", "collect", { item, amount:Number(options.amount || item.quantity || 1) });
  return item;
}
export function collectItems(olam, items = []) { return items.map(item => collectItem(olam, item)).filter(Boolean); }
export default { collectItem, collectItems };
