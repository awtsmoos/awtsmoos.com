// B"H
/**
 * @file ClickTargetPolicy.js
 * @description
 * Clicks select intent; action buttons perform combat. Friendly villagers are
 * never attack targets, empty ground is never an attack command, and hostile
 * wildlife must be deliberately targeted before strikes fire.
 */

export function isFriendlyTarget(target) {
  const data = target?.mesh?.userData || target?.userData || {};
  return Boolean(data.friendly || data.peaceful || data.domestic || target?.friendly || target?.peaceful);
}

export function isInteractiveTarget(target) {
  return target?.type === "customNpc"
    || target?.type === "medabeir"
    || target?.type === "interactiveNpc"
    || target?.type === "cottageDoor"
    || target?.dialogue
    || target?.dialogues
    || target?.type === "interactiveDoor";
}

export function isNpcTarget(target) {
  return ["customNpc", "medabeir", "interactiveNpc"].includes(target?.type);
}

export function isAttackableTarget(target) {
  const data = target?.mesh?.userData || target?.userData || {};
  if (!target || isInteractiveTarget(target) || isNpcTarget(target) || isFriendlyTarget(target)) return false;
  return Boolean(
    data.enemy || data.hostile || data.creature || data.wildlife || data.attackable ||
    target.enemy || target.hostile || target.attackable || target.type === "animal" || target.type === "creature"
  );
}

export function highlightTarget(rootObj, active, colorHex = 0x00ff00) {
  rootObj?.traverse?.(child => {
    if (!child.isMesh || !child.material) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach(mat => {
      if (!mat.emissive) return;
      mat.emissive.setHex(active ? colorHex : 0x000000);
      if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = active ? 0.6 : 1;
    });
  });
}

export function selectCombatTarget(player, target, event = {}) {
  if (!isAttackableTarget(target)) return false;
  if (player.combatTarget?.mesh) highlightTarget(player.combatTarget.mesh, false);
  player.combatTarget = target;
  player.olam.__selectedCombatTarget = target;
  target.__targetedAt = Date.now();
  highlightTarget(target.mesh, true, 0xdd3322);
  player.olam?.ayshPeula?.("ui event", "effectsOverlay", {
    text: `Target ${target.name || target.constructor?.itemName || "enemy"}. Use ATK/SWD/BOW to attack.`,
    color: "#ffcf6a"
  });
  event?.preventDefault?.();
  return true;
}

export function clearCombatTarget(player) {
  if (player?.combatTarget?.mesh) highlightTarget(player.combatTarget.mesh, false);
  if (player) player.combatTarget = null;
  if (player?.olam) player.olam.__selectedCombatTarget = null;
}

export default {
  isFriendlyTarget,
  isInteractiveTarget,
  isNpcTarget,
  isAttackableTarget,
  highlightTarget,
  selectCombatTarget,
  clearCombatTarget
};
