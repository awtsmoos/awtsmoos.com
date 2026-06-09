// B"H
/**
 * @file levelLauncher.js
 * @description Chapter 370: The level launcher is now only the orchestration
 * between fetch and dispatch.
 */
import { fetchLevel } from './levelFetcher.js';
import { dispatchWorldStart } from './worldStartDispatcher.js';
export { fetchLevel };
export async function launchLevel(manager, id) {
  const { id: clean, data } = await fetchLevel(id);
  return dispatchWorldStart(manager, clean, data);
}
