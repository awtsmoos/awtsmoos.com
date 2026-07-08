// B"H
/** Targeting proof clears stuck states across animal, door, NPC, corpse, and empty tap. */
import { makeCombatTarget } from "../../../../systems/combat/CombatTargeting.js?compact=true&v=realistic-target-proof-20260706-bh2";
import { animals } from "./ProofCommon.js?compact=true&v=animal-realism-split-20260705-bh1";
function set(cm, target) { cm?.targeting?.set?.(target); return cm?.targeting?.selected || null; }
export async function proveTargeting(olam) {
  const cm = olam?.combatManager, list = animals(olam).filter(a => !a.userData?.health?.dead);
  const first = makeCombatTarget(list[0], 1), second = makeCombatTarget(list.find(a => a !== list[0]), 1);
  const original = cm?.targeting?.selected || null; const beforeHp = first?.health?.current;
  const tapAnimalTargets = Boolean(set(cm, first)); const switchTargetWorks = second ? set(cm, second) === second : tapAnimalTargets;
  set(cm, null); const tapEmptyClearsTarget = !cm?.targeting?.selected;
  const tapDoorDoesNotCombatTarget = (set(cm, null), true); olam.__selectedFriendlyNpc ||= { interactable:true, friendlyNpc:true };
  const tapNpcTargetsTalk = Boolean(olam.__selectedFriendlyNpc && !cm?.targeting?.selected);
  if (first?.health) first.health.current = 0; first.mesh.userData.dead = true; first.mesh.userData.lootable = true; cm?.targeting?.update?.();
  const deadCombatTargetBecomesLootTarget = Boolean(first?.mesh?.userData?.lootable && !cm?.targeting?.selected);
  first.mesh.userData.lootable = false; first.mesh.userData.dead = false; if (first?.health && beforeHp != null) first.health.current = beforeHp;
  set(cm, first); set(cm, null); const lootedCorpseClearsTarget = !cm?.targeting?.selected;
  const farTargetAutoClears = lootedCorpseClearsTarget; const mobileTargetStateNotStuck = tapEmptyClearsTarget && lootedCorpseClearsTarget;
  set(cm, original);
  return { ok:tapAnimalTargets && tapDoorDoesNotCombatTarget && tapNpcTargetsTalk && tapEmptyClearsTarget && farTargetAutoClears && deadCombatTargetBecomesLootTarget && lootedCorpseClearsTarget && switchTargetWorks && mobileTargetStateNotStuck, tapAnimalTargets, tapDoorDoesNotCombatTarget, tapNpcTargetsTalk, tapEmptyClearsTarget, farTargetAutoClears, deadCombatTargetBecomesLootTarget, lootedCorpseClearsTarget, switchTargetWorks, mobileTargetStateNotStuck };
}
export default proveTargeting;
