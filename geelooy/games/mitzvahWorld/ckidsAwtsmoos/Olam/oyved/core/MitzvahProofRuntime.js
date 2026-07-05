// B"H
/**
 * B"H
 *
 * Mitzvah Proof Runtime is now only the shamash of the proof house.
 * Each domain carries its own lamp: doors, NPCs, animals, houses, loot,
 * movement, combat, loading, and performance. This file lights them in order,
 * gathers their reports, and sends one clone-safe answer back to the page.
 */
import { proveAnimals } from "./proof/ProofAnimals.js?v=combat-quest-story-20260705-bh1";
import { proveCombat } from "./proof/ProofCombat.js?v=combat-quest-story-20260705-bh1";
import { proveDoor } from "./proof/ProofDoor.js?v=combat-quest-story-20260705-bh1";
import { proveHouses } from "./proof/ProofHouses.js?v=combat-quest-story-20260705-bh1";
import { proveLoading } from "./proof/ProofLoading.js?v=combat-quest-story-20260705-bh1";
import { proveLoot } from "./proof/ProofLoot.js?v=combat-quest-story-20260705-bh1";
import { proveMovement } from "./proof/ProofMovement.js?v=combat-quest-story-20260705-bh1";
import { proveNpc } from "./proof/ProofNpc.js?v=combat-quest-story-20260705-bh1";
import { provePerformance } from "./proof/ProofPerformance.js?v=combat-quest-story-20260705-bh1";
import { proveQuests } from "./proof/ProofQuests.js?v=combat-quest-story-20260705-bh1";

const PROOF_ORDER = Object.freeze([
  ["door", proveDoor],
  ["npc", proveNpc],
  ["combat", proveCombat],
  ["animals", proveAnimals],
  ["houses", proveHouses],
  ["loot", proveLoot],
  ["movement", proveMovement],
  ["quests", proveQuests],
  ["loading", proveLoading],
  ["performance", provePerformance]
]);

async function runProof(which, name, fn, olam) {
  if (which !== "all" && which !== name) return null;
  try {
    return await fn(olam);
  } catch (error) {
    return {
      ok:false,
      error:String(error?.message || error),
      stack:String(error?.stack || "").split("\n").slice(0, 5).join(" | ")
    };
  }
}

export async function runMitzvahProof(olam, payload = {}) {
  const startedAt = Date.now();
  const which = payload.which || "all";
  const report = {
    id:payload.id || null,
    seal:"mitzvah-final-proof-worker-20260705-bh2",
    startedAt
  };
  for (const [name, fn] of PROOF_ORDER) report[name] = await runProof(which, name, fn, olam);
  report.finishedAt = Date.now();
  report.durationMs = report.finishedAt - startedAt;
  report.ok = PROOF_ORDER
    .map(([name]) => name)
    .filter(key => report[key])
    .every(key => report[key]?.ok !== false);
  olam.__mitzvahFinalProof = report;
  self.postMessage?.({ type:"mitzvahProofResult", payload:report });
  return report;
}

export default runMitzvahProof;
