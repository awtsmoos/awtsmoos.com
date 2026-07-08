// B"H
/**
 * @file npcDefinitions.js
 * @description Chapter 353: NPC compilation preserves intent fields: missions,
 * debates, shops, level guide, stats, and area notes.
 */
import { enrichNpc } from '../EmeraldVisualEnrichment.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function makeNpcDefinition(npc, index = 0) {
  const n = enrichNpc(npc, index);
  return { id: n.id, name: n.name, x: n.localPos?.x || 0, y: 0.1, z: n.localPos?.z || 0, dialogues: n.dialogueTree ? n.dialogueTree.map(d => d.message) : ['Shalom!'], hasShop: Boolean(n.hasShop), shopInventory: n.shopInventory || [], areaName: n.areaName, areaStats: n.areaStats, areaNote: n.areaNote, hasLevelSelect: Boolean(n.hasLevelSelect), markerType: n.markerType || 'dialogue' };
}
export function makeWandererDefinition(npc, index = 0) {
  const n = enrichNpc(npc, index), p = n.position || { x: 0, z: 0 }, text = n.dialogues || n.dialog || ['B\\"H!'];
  const marker = n.markerType || (n.missionId ? 'mission' : n.canDebate ? 'debate' : 'dialogue');
  return { name: n.name, position: { x: p.x || 0, y: p.y || 0, z: p.z || 0 }, dialogues: text, dialog: text, interactable: true, interactionRange: n.interactionRange || 5.2, canDebate: Boolean(n.canDebate), debateLevel: n.debateLevel || 0, npcId: n.id, markerType: marker, missionId: n.missionId || null, hasMission: Boolean(n.missionId), hasTorahDebate: Boolean(n.canDebate), debateDeckId: n.canDebate ? `emerald_${n.id}_debate` : null, hasShop: Boolean(n.hasShop), shopInventory: n.shopInventory || [], isWandering: Boolean(n.isWandering), clothes: n.clothes || [], areaName: n.areaName, areaStats: n.areaStats, areaNote: n.areaNote, hasLevelSelect: Boolean(n.hasLevelSelect), selectorTitle: n.selectorTitle || 'NPC CHALLENGES', title: n.title || n.name, visualRig: n.visualRig || null };
}
