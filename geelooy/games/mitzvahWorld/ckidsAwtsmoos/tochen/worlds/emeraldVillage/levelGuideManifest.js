// B"H
import { createGuideHumanPayload } from '../../../dvarim/npc/guide/GuideHumanFactory.js';
/**
 * @file levelGuideManifest.js
 * @description Chapter 251: The entrance receives a named shaliach whose whole
 * avodah is clear: speak, show stats, and open the lava ladder level menu.
 */
export const CENTRAL_LEVEL_GUIDE = Object.freeze({
  id: 'central_level_guide',
  name: 'Mitzvah Level Guide',
  position: { x: 0, y: 0, z: -2.8 },
  dialogues: [
    'B"H! I stand at the entry village plaza.',
    'Talk to me to choose the lava jumping levels and every ladder challenge.',
    'The Levels button opens the same strong NPC challenge UI with cards and stats.'
  ],
  markerType: 'levels',
  hasLevelSelect: true,
  hasShop: true,
  shopInventory: [
    { id: 'guide_blue_shirt', name: 'Guide Blue Shirt', icon: '👕', equipSlot: 'shirt', price: 3, sellValue: 1, customData: { meshName: ['shirt', 'outer-shirt'], color: '#4db8ff' } },
    { id: 'guide_gold_shirt', name: 'Guide Gold Shirt', icon: '👕', equipSlot: 'shirt', price: 5, sellValue: 2, customData: { meshName: ['shirt', 'outer-shirt'], color: '#ffd54a' } }
  ],
  areaName: 'Entry Plaza — Level Gate',
  areaStats: { wisdom: 30, kindness: 26, courage: 24, trade: 12, growth: 18, light: 30 },
  areaNote: 'Central NPC: opens lava ladder levels through the NPC challenge UI.',
  visualRig: createGuideHumanPayload(),
  visualRig: createGuideHumanPayload()
});
