// B"H
/** @file CombatRetaliation.js @description Species-specific attack-back after player hits wildlife. */
import { cooldownReady } from "./CombatCooldowns.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { resolveRetaliationHit } from "./CombatHitResolution.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { speciesCombatRule } from "./CombatRules.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { damagePlayer } from "./CombatStats.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { flashTarget, emitCombatFeedback } from "./CombatFeedback.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function posOf(entity) { return entity?.mesh?.position || entity?.position || null; }
function distance(a, b) { return a && b ? Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) : Infinity; }
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function speciesOf(target) {
  const mesh = target?.mesh || target;
  return mesh?.userData?.motion?.species || mesh?.userData?.species || target?.def?.species || "rabbit";
}

export function observeCombatHit(olam, target, amount = 0) {
  const mesh = target?.mesh || target;
  if (!mesh?.userData || Number(amount || 0) <= 0 || mesh.userData.health?.dead) return null;
  const species = speciesOf(target), rule = speciesCombatRule(species), player = playerOf(olam);
  const dist = distance(posOf(mesh), posOf(player));
  const ready = cooldownReady(mesh, "retaliation", rule.cooldownMs);
  mesh.__creatureState ||= {};
  const state = rule.flees && rule.damage <= 0 ? "flee" : rule.retaliation;
  Object.assign(mesh.__creatureState, { state, reason:"player-hit", target:"player", changedAt:Date.now() });
  mesh.userData.creatureCombatState = mesh.__creatureState;
  mesh.userData.state = state;
  const hit = resolveRetaliationHit(mesh, rule, dist);
  let playerDamage = 0;
  if (ready && hit.damage > 0) {
    playerDamage = damagePlayer(player, hit.damage);
    flashTarget(mesh, 0xaa5500);
    emitCombatFeedback(olam, `${species.toUpperCase()} ${rule.retaliation.replace("_", " ")}`, "#ffbf66");
  }
  const entry = { at:Date.now(), species, retaliation:rule.retaliation, state, ready, distance:dist, range:hit.range, rangeChecked:true, dodged:hit.dodged, playerDamage, difficultyTier:rule.tier };
  olam.__combatAdventureDiag ||= { events:[], attackBackAndForthCount:0 };
  olam.__combatAdventureDiag.events.push(entry);
  olam.__combatAdventureDiag.events = olam.__combatAdventureDiag.events.slice(-30);
  if (playerDamage > 0) olam.__combatAdventureDiag.attackBackAndForthCount = Number(olam.__combatAdventureDiag.attackBackAndForthCount || 0) + 1;
  return entry;
}

export default { observeCombatHit };
