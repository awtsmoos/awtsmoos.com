// B"H
/**
 * @file applyEntryRuntime.js
 * @description Chapter 501: A small bridge from world-load data to live entry
 * UI, camera, and ambience actions.
 */
import { getEmeraldEntryScene } from './entryRuntimeDetector.js';
import { emitEmeraldEntryUiEvents } from './entryRuntimeUiEvents.js';
export function applyEntryRuntime(olam, nivrayim = {}) {
  const entryScene = getEmeraldEntryScene(nivrayim);
  if (!entryScene) return false;
  olam.__emeraldEntryScene = entryScene;
  return emitEmeraldEntryUiEvents(olam, entryScene);
}
