// B"H
/**
 * @file entryRuntimeDetector.js
 * @description Chapter 499: Detects when the loaded world is the Emerald entry
 * scene and extracts the runtime metadata without disturbing object loading.
 */
export function getEmeraldEntryScene(nivrayim = {}) {
  const scene = nivrayim.EntryScene?.manifest ? nivrayim.EntryScene : null;
  if (!scene?.manifest?.id?.includes?.('emerald_first_entry_scene')) return null;
  return scene;
}
