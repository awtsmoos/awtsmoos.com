// B"H
const HOSTILE_WILDLIFE = new Set(["fox", "wolf", "boar", "serpent", "spider", "scorpion", "mazik"]);

export function combatTargetAllowed(data = {}, species = "target") {
  if (data.friendly || data.peaceful || data.domestic || data.nonCombat || data.combatDisabled || data.attackable === false) return false;
  if (data.isEnemy || data.enemy || data.hostile || data.attackable || data.combatTargetProxy) return true;
  if (data.creatureCombat && data.creatureCombat.peaceful === false) return true;
  return Boolean((data.proceduralSkinnedAnimal || data.wildlifeActor || data.selectableCombatTarget) && HOSTILE_WILDLIFE.has(species));
}

export default combatTargetAllowed;
