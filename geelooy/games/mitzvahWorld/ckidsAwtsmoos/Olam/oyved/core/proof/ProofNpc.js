// B"H
/**
 * B"H
 *
 * NPC proof checks the stable soul of the interaction, not only the costume.
 * A villager must be targetable and able to speak even while the full GLB is
 * still being requested for near range.
 */
import { collectNpcLodDiagnostics } from "../../../../systems/npc/NpcLodDiagnostics.js?compact=true&v=deferred-npc-glb-20260705-bh1";
import { attachQuestMarker, collectQuestMarkerCounts } from "../../../../systems/quests/QuestMarkers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { acceptQuest, noteQuestItemCollected } from "../../../../systems/quests/QuestState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { player, restorePlayer, setPlayerNear, sleep } from "./ProofCommon.js?compact=true&v=animal-realism-split-20260705-bh1";

function npcList(olam) {
  return (olam?.interactableNivrayim || []).filter(n => ["customNpc", "medabeir", "interactiveNpc"].includes(n?.type));
}

export async function proveNpc(olam) {
  const npc = npcList(olam)[0];
  if (!npc) return { ok:false, reason:"no-friendly-npc", friendlyCount:0 };
  const before = setPlayerNear(olam, npc, { x:1, y:0, z:1 });
  const actor = { type:"click", button:0, explicit:true, isPointer:true, source:"proof-npc", player:player(olam) };
  const first = npc.ayshPeula?.("accepted interaction", actor);
  await sleep(120);
  const selected = olam.__selectedFriendlyNpc === npc;
  const second = npc.ayshPeula?.("accepted interaction", actor);
  await sleep(320);
  const diag = olam.__mitzvahNpcDiag || null;
  const lod = collectNpcLodDiagnostics(olam);
  const miriam = npcList(olam).find(n => n.name === "Miriam");
  if (miriam) {
    acceptQuest(olam, "miriam_feathers");
    noteQuestItemCollected(olam, "feather", 4);
    attachQuestMarker(miriam.mesh, miriam, olam);
  }
  const markers = collectQuestMarkerCounts(olam);
  const questNpcCount = npcList(olam).filter(n => n.questId).length;
  restorePlayer(olam, before);
  return { ok:Boolean(first && selected && second && diag?.lastDialogueEvent), name:npc.name || null, first, selected, second, friendlyCount:npcList(olam).length, targetableCount:npcList(olam).filter(n => n?.interactable && (n?.raycastMesh || n?.interactionMesh || n?.mesh)).length, dialogueOpen:Boolean(diag?.lastDialogueEvent), questNpcCount, markerBangCount:markers.availableMarkers, markerQuestionCount:markers.completeMarkers, jillQuestAvailable:npcList(olam).some(n => n.name === "Jill" && n.questId === "jill_gifts"), diag, ...markers, ...lod };
}

export default proveNpc;
