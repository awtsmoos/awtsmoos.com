// B"H
/**
 * @file levelLauncher.js
 * @description Chapter 370: The level launcher is now only the orchestration
 * between fetch and dispatch.
 */
import { fetchLevel } from './levelFetcher.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { dispatchWorldStart } from './worldStartDispatcher.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export { fetchLevel };
export async function launchLevel(manager, id) {
  const { id: clean, data } = await fetchLevel(id);
  return dispatchWorldStart(manager, clean, data);
}
