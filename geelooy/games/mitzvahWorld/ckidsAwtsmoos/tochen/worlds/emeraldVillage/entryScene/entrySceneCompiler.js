// B"H
/**
 * @file entrySceneCompiler.js
 * @description Chapter 409: The entry scene compiles into the live world data,
 * carrying the screenshot promise into the exported Emerald level.
 */
import { REFERENCE_SHOT_CHECKLIST } from '../artDirection/referenceShotChecklist.js';
import { ENTRY_HUD_MANIFEST } from './entryHudManifest.js';
import { ENTRY_SCENE_MANIFEST } from './entrySceneManifest.js';
import { ENTRY_CAMERA_MANIFEST } from '../camera/entryCameraManifest.js';
import { entryVillageAmbience } from '../audio/entryVillageAmbience.js';
import { marketAmbience } from '../audio/marketAmbience.js';
import { waterfallAmbience } from '../audio/waterfallAmbience.js';
import { treeGlowAmbience } from '../audio/treeGlowAmbience.js';
export function applyEntryScene(n) {
  n.EntryScene = { manifest: ENTRY_SCENE_MANIFEST, hud: ENTRY_HUD_MANIFEST, artDirection: REFERENCE_SHOT_CHECKLIST, camera: ENTRY_CAMERA_MANIFEST, audio: { entry: entryVillageAmbience(), market: marketAmbience(), water: waterfallAmbience(), tree: treeGlowAmbience() } };
  n.__entryScene = { firstEntry: true, hudPanels: true, questPrompt: true, guideNpc: true, centralTree: true, screenshotTarget: true, camera: true, audio: true };
  return n;
}
