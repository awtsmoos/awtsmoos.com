// B"H
/** @file ProofQuests.js @description Exercises kid quest accept/progress/turn-in and markers. */
import { addBagItem } from "../../../../systems/inventory/BagRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { acceptQuest, noteQuestItemCollected, turnInQuest } from "../../../../systems/quests/QuestState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { attachQuestMarker } from "../../../../systems/quests/QuestMarkers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { collectQuestDiagnostics } from "../../../../systems/quests/QuestDiagnostics.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function questNpc(olam, name) {
  return (olam?.interactableNivrayim || []).find(n => n?.name === name || n?.questId);
}

export async function proveQuests(olam) {
  const jill = questNpc(olam, "Jill");
  if (!jill) return { ok:false, reason:"no-quest-npc" };
  attachQuestMarker(jill.mesh, jill, olam);
  const accepted = acceptQuest(olam, "jill_gifts");
  for (let i = 0; i < 3; i++) {
    addBagItem(olam, "gift_token", { silent:true });
    noteQuestItemCollected(olam, "gift_token", 1);
  }
  attachQuestMarker(jill.mesh, jill, olam);
  const turnedIn = turnInQuest(olam, "jill_gifts");
  const miriam = questNpc(olam, "Miriam");
  if (miriam) {
    acceptQuest(olam, "miriam_feathers");
    noteQuestItemCollected(olam, "feather", 4);
    attachQuestMarker(miriam.mesh, miriam, olam);
  }
  const avraham = questNpc(olam, "Reb Avraham");
  if (avraham) attachQuestMarker(avraham.mesh, avraham, olam);
  const diag = collectQuestDiagnostics(olam);
  const out = { ok:Boolean(accepted.ok && turnedIn.ok && diag.rewardGranted), acceptedQuest:accepted.ok, progressUpdated:diag.progressUpdated, turnInReady:diag.turnInReady, turnInCompleted:diag.turnInCompleted, rewardGranted:diag.rewardGranted, ...diag };
  olam.__mitzvahQuestDiag = out;
  globalThis.__MITZVAH_QUEST_DIAG__ = () => out;
  return out;
}

export default proveQuests;
