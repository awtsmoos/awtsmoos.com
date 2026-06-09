// B"H
/**
 * @file entryRuntimeUiEvents.js
 * @description Chapter 500: After Emerald loads, its screenshot systems are
 * no longer silent metadata: HUD, quest, portrait, camera, and ambience are
 * emitted as real UI events.
 */
export function emitEmeraldEntryUiEvents(olam, entryScene) {
  if (!olam?.ayshPeula || !entryScene) return false;
  olam.ayshPeula('ui event', 'emeraldEntryHud', { entryScene });
  olam.ayshPeula('ui event', 'emeraldQuestCard', { entryScene });
  olam.ayshPeula('ui event', 'emeraldNpcPortrait', { portrait: entryScene.hud?.npcPanel });
  olam.ayshPeula('ui event', 'emeraldCameraCue', { camera: entryScene.camera, entryScene });
  olam.ayshPeula('ui event', 'emeraldAmbientAudio', { audio: entryScene.audio, entryScene });
  return true;
}
