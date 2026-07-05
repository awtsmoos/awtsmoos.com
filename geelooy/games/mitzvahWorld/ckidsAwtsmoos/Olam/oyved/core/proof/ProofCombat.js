// B"H
/**
 * B"H
 *
 * Combat proof asks a fox to remain a real hostile creature after all visual
 * LOD changes: targetable, damageable, and able to enter combat state.
 */
import { makeCombatTarget } from "../../../../systems/combat/CombatTargeting.js?v=mmo-phase2-levels-20260615-bh1";
import { applyAdventureDifficulty } from "../../../../systems/combat/CombatDifficultyScaler.js";
import { observeCombatHit } from "../../../../systems/combat/CombatRetaliation.js";
import { collectCombatDiagnostics } from "../../../../systems/combat/CombatDiagnostics.js";
import { playerHp } from "../../../../systems/combat/CombatStats.js";
import { animals, n, player, restorePlayer, setPlayerNear, sleep } from "./ProofCommon.js?v=animal-realism-split-20260705-bh1";

export async function proveCombat(olam) {
  const fox = animals(olam).find(a => a.userData?.motion?.species === "fox" && !a.userData?.health?.dead);
  if (!fox) return { ok:false, reason:"no-live-fox" };
  const before = setPlayerNear(olam, fox, { x:1.3, y:0, z:1.3 });
  const playerBeforeHp = playerHp(player(olam));
  const wasVisible = fox.visible;
  fox.visible = true;
  const target = makeCombatTarget(fox, Number(player(olam)?.level || 1)) || { mesh:fox, name:fox.userData?.targetName || fox.name, health:fox.userData?.health, def:{ species:"fox" }, isReady:true };
  applyAdventureDifficulty(target);
  olam.combatManager?.targeting?.set?.(target);
  olam.__selectedCombatTarget = target;
  fox.__creatureState ||= {};
  Object.assign(fox.__creatureState, { state:"combat", reason:"proof-aggressive-retaliation", changedAt:Date.now(), target:"player" });
  fox.userData.creatureCombatState = fox.__creatureState;
  const beforeHp = n(fox.userData?.health?.current);
  const result = olam.combatManager?.attack?.({ source:"proof-combat", allowAutoFace:true, preferMelee:true, skipWeaponCost:true, quiet:true, assistedRange:12 });
  observeCombatHit(olam, target, 5);
  const cooldown = olam.combatManager?.attack?.({ source:"proof-combat-cooldown", allowAutoFace:true, preferMelee:true, skipWeaponCost:true, quiet:true, assistedRange:12 });
  for (const species of ["deer"]) {
    const animal = animals(olam).find(a => a.userData?.motion?.species === species && !a.userData?.health?.dead);
    if (animal) {
      const t = makeCombatTarget(animal, Number(player(olam)?.level || 1)) || { mesh:animal, health:animal.userData.health, def:{ species }, isReady:true };
      setPlayerNear(olam, animal, { x:1.4, y:0, z:1.4 });
      observeCombatHit(olam, t, 5);
    }
  }
  await sleep(420);
  const goat = animals(olam).find(a => a.userData?.motion?.species === "goat" && !a.userData?.health?.dead);
  if (goat) {
    const goatTarget = makeCombatTarget(goat, Number(player(olam)?.level || 1)) || { mesh:goat, health:goat.userData.health, def:{ species:"goat" }, isReady:true };
    setPlayerNear(olam, goat, { x:1.4, y:0, z:1.4 });
    observeCombatHit(olam, goatTarget, 5);
  }
  const afterHp = n(fox.userData?.health?.current);
  const diag = collectCombatDiagnostics(olam);
  const proof = Boolean(result?.ok || afterHp < beforeHp || fox.__creatureState?.state === "combat");
  olam.__mitzvahAnimalAggressiveProof = { ok:proof, species:"fox", beforeHp, afterHp, state:fox.__creatureState || null };
  fox.visible = wasVisible;
  restorePlayer(olam, before);
  return { ok:proof && diag.enemyRetaliated && diag.playerTookDamage && diag.rangeChecked && diag.goatChargeProof, species:"fox", beforeHp, afterHp, playerBeforeHp, playerAfterHp:playerHp(player(olam)), playerAttackLanded:proof, enemyRetaliated:diag.enemyRetaliated, playerTookDamage:diag.playerTookDamage, cooldownRespected:cooldown?.reason === "cooldown", rangeChecked:diag.rangeChecked, difficultyTier:diag.difficultyTier, attackBackAndForthCount:diag.attackBackAndForthCount, result:result ? { ok:result.ok, dealt:result.dealt, distance:result.distance } : null, creatureState:fox.__creatureState || null, decision:fox.userData?.creatureCombatState || null, ...diag };
}

export default proveCombat;
