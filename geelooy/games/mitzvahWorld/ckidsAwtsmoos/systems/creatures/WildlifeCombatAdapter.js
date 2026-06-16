// B"H
/** @file WildlifeCombatAdapter.js @description Bridges wildlife renderer to threat, aggro, leash, packs, guards, and mission state. */
import { territoryForPosition } from "./TerritoryRuntime.js";
import { ensureCreatureState, setCreatureState, creatureStatePayload } from "./CreatureStateMachine.js";
import { addThreat, decayThreat, threatPayload } from "./ThreatRuntime.js";
import { updateLeash, leashPayload } from "./LeashRuntime.js";
import { updateAggro } from "./AggroRuntime.js";
import { alertPack } from "./PackBehaviorRuntime.js";
import { guardWarn } from "./GuardRuntime.js";
import { progressActiveObjectives } from "../missions/MissionObjectiveRuntime.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function ppos(entity) { return entity?.mesh?.position || entity?.position || null; }
function dist(a, b) { return a && b ? Math.hypot((a.x || 0) - (b.x || 0), (a.z || 0) - (b.z || 0)) : Infinity; }
function isPeaceful(animal, territory) { const s = animal?.userData || animal?.mesh?.userData || {}; return Boolean(s.peaceful || territory?.peaceful || s.domestic); }
export function ensureWildlifeCombat(animal, olam) {
  const s = ensureCreatureState(animal); const p = ppos(animal), territory = territoryForPosition(p?.x || 0, p?.z || 0);
  animal.__wildlifeCombat ||= { territory:territory?.id || null, peaceful:isPeaceful(animal, territory), lastDecision:null };
  return { state:s, wildlife:animal.__wildlifeCombat, territory };
}
export function updateWildlifeCombat(animal, olam) {
  const player = playerOf(olam), playerPos = ppos(player), animalPos = ppos(animal); if (!player || !animalPos) return false;
  const info = ensureWildlifeCombat(animal, olam), d = dist(playerPos, animalPos), territory = info.territory;
  decayThreat(animal, .05); updateLeash(animal);
  if (territory?.id) progressActiveObjectives(olam, `enterTerritory:${territory.id}`, 1);
  if (!info.wildlife.peaceful && d < 18) { updateAggro(animal, player, 18); addThreat(animal, "player", Math.max(.5, 18 - d)); alertPack(animal, olam?.wildlife || olam?.nivrayim || [], "player"); }
  if (territory?.danger && d < 28) guardWarn(olam, "road_guard", `Danger near ${territory.id}`);
  info.wildlife.lastDecision = decisionFromWildlifeCombat(animal, olam);
  olam?.ayshPeula?.("ui event", "wildlifeCombat", { creature:animal.name, state:creatureStatePayload(animal), threat:threatPayload(animal), leash:leashPayload(animal), decision:info.wildlife.lastDecision });
  return info.wildlife.lastDecision;
}
export function decisionFromWildlifeCombat(animal, olam) {
  const s = ensureCreatureState(animal); if (s.state === "return_home") return { action:"return_home", reason:"leash" };
  if (s.state === "combat") return { action:"chase", target:"player", reason:s.reason || "aggro" };
  if (s.state === "patrol") return { action:"patrol", reason:"route" };
  return { action:"idle", reason:"calm" };
}
export default { ensureWildlifeCombat, updateWildlifeCombat, decisionFromWildlifeCombat };
