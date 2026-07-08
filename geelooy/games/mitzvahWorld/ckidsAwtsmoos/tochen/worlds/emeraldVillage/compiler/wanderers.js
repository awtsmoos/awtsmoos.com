// B"H
/** @file wanderers.js @description Chapter 357: Outdoor souls enter the village, including the central level guide. */
import { CENTRAL_LEVEL_GUIDE } from '../levelGuideManifest.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { WANDERING_NPCS } from '../npcManifest.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { makeWandererDefinition } from './npcDefinitions.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function addWanderers(n) {
  WANDERING_NPCS.forEach((npc, i) => { n.InteractiveNpc[npc.id] = makeWandererDefinition(npc, i); });
  n.InteractiveNpc[CENTRAL_LEVEL_GUIDE.id] = makeWandererDefinition(CENTRAL_LEVEL_GUIDE, WANDERING_NPCS.length + 99);
}
