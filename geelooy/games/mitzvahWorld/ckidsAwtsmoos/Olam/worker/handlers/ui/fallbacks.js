// B"H
/**
 * @file fallbacks.js
 * @description Chapter 510: Fallback routing now conducts every Emerald runtime
 * surface: entry HUD, quest, portrait, camera cue, ambient audio, effects,
 * shop, inventory, HUD counters, and direct NPC/level gates.
 */
import { directFallbackMap } from './directFallbackMap.js?v=village-polish-20260612-bh810';
import { handleEffectsFallback } from './effectsFallback.js?v=lava-camera-axis-20260609-bh640';
import { handleEmeraldAudioFallback } from './emeraldAudioFallback.js';
import { handleEmeraldCameraFallback } from './emeraldCameraFallback.js';
import { handleEmeraldHudFallback } from './emeraldHudFallback.js';
import { handleEmeraldQuestFallback } from './emeraldQuestFallback.js';
import { handleHudFallback } from './hudFallback.js';
import { dispatchInventory } from './inventoryFallback.js';
import { handleNpcPortraitFallback } from './npcPortraitFallback.js';
import { openShopOverlay } from './shopOverlay.js?v=npc-scroll-pass-through-20260609-bh638';
export { dispatchInventory };
export function directFallback(manager, shaym, ob = {}) {
  handleHudFallback(shaym, ob);
  handleEmeraldHudFallback(shaym, ob);
  handleEmeraldQuestFallback(shaym, ob);
  handleNpcPortraitFallback(shaym, ob);
  handleEmeraldCameraFallback(shaym, ob);
  handleEmeraldAudioFallback(shaym, ob);
  if (shaym === 'storeScreen' && ob?.open) openShopOverlay(manager, ob.open, ob.open.mode || 'buy');
  handleEffectsFallback(manager, shaym, ob);
  directFallbackMap(manager, ob)[shaym]?.();
}
