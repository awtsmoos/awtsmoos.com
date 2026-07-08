/**
 * B"H
 * Chapter 55: The NPC Answered The Tap.
 * Chapter 56: The answer now waits at the border of closeness.
 * Chapter 57: Mission and debate no longer conceal one another.
 */

import { describeNpcRange } from './NpcRangeGate.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

function npcId(data, npc) {
  return data.npcId || npc.name || npc.id || null;
}

export class NpcInteractionRuntime {
  interact(npc = {}, context = {}) {
    const data = npc.userData || npc;
    const range = describeNpcRange(npc, context.player || context.oyved || {}, context.range || data.interactionRange || 4.5);

    if (context.player || context.oyved) {
      if (!range.ok) return { kind: 'out_of_range', npcId: npcId(data, npc), range };
    }

    if (data.hasTorahDebate) {
      return {
        kind: 'debate',
        npcId: npcId(data, npc),
        debateDeckId: data.debateDeckId,
        opensBattleDebate: data.opensBattleDebate !== false,
        missionId: data.missionId || null,
        markerType: data.markerType,
        range
      };
    }

    if (data.hasMission) {
      return {
        kind: 'mission',
        npcId: npcId(data, npc),
        missionId: data.missionId,
        markerType: data.markerType,
        range
      };
    }

    return { kind: 'dialogue', npcId: npcId(data, npc), range };
  }
}

export default NpcInteractionRuntime;
