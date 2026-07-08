// B"H
/**
 * @file applyEntryRuntime.js
 * @description Chapter 501: A small bridge from world-load data to live entry
 * UI, camera, and ambience actions.
 */
import { getEmeraldEntryScene } from './entryRuntimeDetector.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { emitEmeraldEntryUiEvents } from './entryRuntimeUiEvents.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function applyEntryRuntime(olam, nivrayim = {}) {
  const entryScene = getEmeraldEntryScene(nivrayim);
  if (!entryScene) return false;
  olam.__emeraldEntryScene = entryScene;
  return emitEmeraldEntryUiEvents(olam, entryScene);
}
