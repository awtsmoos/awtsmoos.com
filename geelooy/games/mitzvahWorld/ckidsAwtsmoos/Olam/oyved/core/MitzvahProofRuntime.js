// B"H
/** Mitzvah Proof Runtime: one proof flame for real mobile play, not false green. */
import { proveAnimals } from "./proof/ProofAnimals.js?v=combat-quest-story-20260705-bh1";
import { proveClarity } from "./proof/ProofClarity.js?v=mobile-real-fix-20260705-bh1";
import { proveCombat } from "./proof/ProofCombat.js?v=mobile-real-fix-20260705-bh1";
import { proveConsoleHygiene } from "./proof/ProofConsoleHygiene.js?v=mobile-real-fix-20260705-bh1";
import { proveDoor } from "./proof/ProofDoor.js?v=combat-quest-story-20260705-bh1";
import { proveHouses } from "./proof/ProofHouses.js?v=combat-quest-story-20260705-bh1";
import { proveLoading } from "./proof/ProofLoading.js?v=mobile-real-fix-20260705-bh1";
import { proveLoot } from "./proof/ProofLoot.js?v=combat-quest-story-20260705-bh1";
import { proveMobileDoor } from "./proof/ProofMobileDoor.js?v=mobile-real-fix-20260705-bh1";
import { proveMovement } from "./proof/ProofMovement.js?v=combat-quest-story-20260705-bh1";
import { proveNpc } from "./proof/ProofNpc.js?v=combat-quest-story-20260705-bh1";
import { provePerformance } from "./proof/ProofPerformance.js?v=mobile-real-fix-20260705-bh1";
import { proveQuests } from "./proof/ProofQuests.js?v=combat-quest-story-20260705-bh1";
import { proveTargeting } from "./proof/ProofTargeting.js?v=mobile-real-fix-20260705-bh1";
const PROOF_ORDER = Object.freeze([["door", proveDoor], ["mobileDoor", proveMobileDoor], ["npc", proveNpc], ["combat", proveCombat], ["targeting", proveTargeting], ["clarity", proveClarity], ["animals", proveAnimals], ["houses", proveHouses], ["loot", proveLoot], ["movement", proveMovement], ["quests", proveQuests], ["loading", proveLoading], ["performance", provePerformance], ["consoleHygiene", proveConsoleHygiene]]);
async function runProof(which, name, fn, olam) { if (which !== "all" && which !== name) return null; try { return await fn(olam); } catch (error) { return { ok:false, error:String(error?.message || error), stack:String(error?.stack || "").split("\n").slice(0, 5).join(" | ") }; } }
export async function runMitzvahProof(olam, payload = {}) {
  const startedAt = Date.now(), which = payload.which || "all", report = { id:payload.id || null, seal:"mitzvah-mobile-real-proof-20260705-bh1", startedAt };
  for (const [name, fn] of PROOF_ORDER) report[name] = await runProof(which, name, fn, olam);
  report.doors = report.door; report.combatReal = report.combat?.combatReal || report.combat; report.mobilePerformance = report.performance?.mobilePerformance || report.performance;
  report.finishedAt = Date.now(); report.durationMs = report.finishedAt - startedAt;
  report.ok = PROOF_ORDER.map(([name]) => name).filter(key => report[key]).every(key => report[key]?.ok !== false);
  olam.__mitzvahFinalProof = report; self.postMessage?.({ type:"mitzvahProofResult", payload:report }); return report;
}
export default runMitzvahProof;
