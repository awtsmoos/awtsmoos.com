/**
 * B"H
 * Chapter 55: The NPC Answered The Tap.
 */

export class NpcInteractionRuntime {
  interact(npc = {}) {
    const data = npc.userData || npc;
    if (data.hasMission) return { kind: 'mission', missionId: data.missionId, markerType: data.markerType };
    if (data.hasTorahDebate) return { kind: 'debate', debateDeckId: data.debateDeckId, opensBattleDebate: Boolean(data.opensBattleDebate) };
    return { kind: 'dialogue', npcId: data.npcId || npc.name || npc.id || null };
  }
}

export default NpcInteractionRuntime;
