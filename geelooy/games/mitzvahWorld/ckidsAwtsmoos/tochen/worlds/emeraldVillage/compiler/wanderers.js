// B"H
/** @file wanderers.js @description Chapter 357: Outdoor souls enter the village, including the central level guide. */
import { CENTRAL_LEVEL_GUIDE } from '../levelGuideManifest.js';
import { WANDERING_NPCS } from '../npcManifest.js';
import { makeWandererDefinition } from './npcDefinitions.js';
export function addWanderers(n) {
  WANDERING_NPCS.forEach((npc, i) => { n.InteractiveNpc[npc.id] = makeWandererDefinition(npc, i); });
  n.InteractiveNpc[CENTRAL_LEVEL_GUIDE.id] = makeWandererDefinition(CENTRAL_LEVEL_GUIDE, WANDERING_NPCS.length + 99);
}
