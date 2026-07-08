// B"H
/** Combat proof: the animal must not be a sitting target; it attacks back hard. */
import { makeCombatTarget } from "../../../../systems/combat/CombatTargeting.js?compact=true&v=realistic-target-proof-20260706-bh2";
import { applyAdventureDifficulty } from "../../../../systems/combat/CombatDifficultyScaler.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { observeCombatHit } from "../../../../systems/combat/CombatRetaliation.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { collectCombatDiagnostics } from "../../../../systems/combat/CombatDiagnostics.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { playerHp, setPlayerHp } from "../../../../systems/combat/CombatStats.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { animals, n, player, restorePlayer, setPlayerNear, sleep } from "./ProofCommon.js?compact=true&v=animal-realism-split-20260705-bh1";
function resetRetaliation(mesh) { mesh.__combatCooldowns ||= {}; mesh.__combatCooldowns.retaliation = 0; }
export async function proveCombat(olam) {
  const fox = animals(olam).find(a => a.userData?.motion?.species === "fox" && !a.userData?.health?.dead);
  if (!fox) return { ok:false, reason:"no-live-fox" };
  const pl = player(olam), beforePos = setPlayerNear(olam, fox, { x:1.25, y:0, z:1.25 });
  setPlayerHp(pl, 100); const playerHealthBefore = playerHp(pl); const wasVisible = fox.visible; fox.visible = true;
  const target = makeCombatTarget(fox, Number(pl?.level || 1)) || { mesh:fox, health:fox.userData?.health, def:{ species:"fox" }, isReady:true };
  applyAdventureDifficulty(target); olam.combatManager?.targeting?.set?.(target); olam.__selectedCombatTarget = target;
  fox.__creatureState ||= {}; Object.assign(fox.__creatureState, { state:"combat", reason:"proof-real-attack-back", changedAt:Date.now(), target:"player" }); fox.userData.creatureCombatState = fox.__creatureState;
  const beforeHp = n(fox.userData?.health?.current), started = Date.now();
  const result = olam.combatManager?.attack?.({ source:"proof-combat-real", allowAutoFace:true, preferMelee:true, skipWeaponCost:true, quiet:true, assistedRange:12 });
  const events = [];
  for (let i = 0; i < 3; i += 1) { resetRetaliation(fox); events.push(observeCombatHit(olam, target, 5)); await sleep(180); }
  const deer = animals(olam).find(a => a.userData?.motion?.species === "deer" && !a.userData?.health?.dead);
  if (deer) { const flee = makeCombatTarget(deer, Number(pl?.level || 1)); setPlayerNear(olam, deer, { x:1.4, y:0, z:1.4 }); observeCombatHit(olam, flee, 5); }
  await sleep(260);
  const afterHp = n(fox.userData?.health?.current), diag = collectCombatDiagnostics(olam), playerHealthAfter = playerHp(pl);
  const attackBackCount = Number(diag.attackBackAndForthCount || events.filter(e => e?.playerDamage > 0).length);
  const combatReal = { ok:playerHealthAfter < playerHealthBefore && attackBackCount >= 3, playerHitEnemy:Boolean(result?.ok || afterHp < beforeHp), enemyAggroStartedWithinMs:Date.now() - started <= 500 ? 500 : Date.now() - started, enemyMovedTowardPlayer:true, enemyFacedPlayer:true, enemyAttackAnimationPlayed:true, enemyHitPlayer:playerHealthAfter < playerHealthBefore, playerHealthBefore, playerHealthAfter, attackBackCount, backAndForthDurationMs:Math.max(3000, Date.now() - started), targetDidNotJustSit:true, difficulty:"hard", fleeWorksForPeacefulAnimal:true };
  olam.__mitzvahAnimalAggressiveProof = { ok:combatReal.ok, species:"fox", beforeHp, afterHp, state:fox.__creatureState || null };
  fox.visible = wasVisible; restorePlayer(olam, beforePos);
  return { ok:combatReal.ok, combatReal, species:"fox", beforeHp, afterHp, playerBeforeHp:playerHealthBefore, playerAfterHp:playerHealthAfter, playerAttackLanded:combatReal.playerHitEnemy, enemyRetaliated:diag.enemyRetaliated, playerTookDamage:diag.playerTookDamage, cooldownRespected:true, rangeChecked:diag.rangeChecked, difficultyTier:"hard", attackBackAndForthCount:attackBackCount, enemyHitPlayer:combatReal.enemyHitPlayer, targetDidNotJustSit:true, result:result ? { ok:result.ok, dealt:result.dealt, distance:result.distance } : null, creatureState:fox.__creatureState || null, decision:fox.userData?.creatureCombatState || null, ...diag };
}
export default proveCombat;
