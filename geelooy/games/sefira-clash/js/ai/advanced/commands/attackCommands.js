/**
 * B"H
 * Attack command helpers.
 *
 * Chapter 84: violence increases only through valid gates. ForceApproach never
 * punches from too far; KillConfirm never ignores lane law; ComboContinue only
 * becomes rapid pressure when the validator says the target is truly hittable.
 */
import { applyChargePlan, cancelCharge } from '../combat/chargeController.js';
import { rememberIssuedAttack } from '../memory/actionMemory.js';

export function applyAttackCommand(bot, world, out, attackCheck, commitment) {
  if (!attackCheck.valid) return approachInstead(bot, world, out);
  const tactic = world.combatTactic;
  const pocket = world.combatPocket;
  out.aimX = tactic.aimX || pocket.aimX;
  out.aimY = tactic.aimY || pocket.aimY || 0;
  out.y = out.aimY;
  out.x = combatFootwork(bot, world, pocket, commitment);
  if (shouldRapid(world, commitment)) return rapid(bot, out);
  if (tactic.instant) return instant(bot, world, out, tactic);
  rememberIssuedAttack(bot, tactic.kind);
  applyChargePlan(bot, world, tactic, out);
}

export function clearChargeOutsideAttack(bot, mode) {
  if (!mode?.startsWith('Attack')) cancelCharge(bot);
}

function approachInstead(bot, world, out) {
  const goal = world.comboMomentum?.active ? world.target.x : world.combatPocket.standX;
  out.x = Math.sign(goal - bot.x || world.target.x - bot.x || 1);
  out.aimX = Math.sign(world.target.x - bot.x || 1);
}

function shouldRapid(world, commitment) {
  if (!world.combat.reachableClose) return false;
  if (world.combatHeat?.killMode && world.edgePressure?.score > 0.25) return false;
  return ['RapidPressure', 'ComboContinue', 'ForceApproach'].includes(commitment.name) || world.comboMomentum?.active;
}

function instant(bot, world, out, tactic) {
  if (!canPulse(bot, tactic.button)) return;
  rememberIssuedAttack(bot, tactic.kind);
  if (tactic.button === 'grab') out.grab = pulse(bot, 'grab', 14);
  else if (tactic.button === 'kick') out.kick = pulse(bot, 'kick', world.combatHeat?.killMode ? 11 : 14);
  else if (tactic.button === 'punch') out.punch = pulse(bot, 'punch', world.combatHeat?.forceEngage ? 7 : 10);
}

function rapid(bot, out) {
  if (!canPulse(bot, 'punch')) return;
  rememberIssuedAttack(bot, 'RapidPressure');
  out.rapidPunch = true;
  out.punch = pulse(bot, 'punch', 4);
}

function combatFootwork(bot, world, pocket, commitment) {
  const dx = world.target.x - bot.x;
  if (world.combat.reachableClose) return closeFootwork(dx, commitment);
  if (Math.abs(dx) < 110 && world.combat.sameFightingLane) return 0;
  return Math.sign(pocket.standX - bot.x || dx || 1);
}

function closeFootwork(dx, commitment) {
  if (commitment.name === 'ComboContinue' || commitment.name === 'ForceApproach') return Math.sign(dx || 1) * 0.12;
  return -Math.sign(dx || 1) * 0.12;
}

function canPulse(bot, button) {
  return (bot.aiMind?.buttonClock?.[button] || 0) <= 0;
}

function pulse(bot, button, gap) {
  bot.aiMind.buttonClock[button] = gap;
  bot.charge ||= {};
  bot.charge.prev ||= {};
  bot.charge.prev[button] = false;
  return true;
}
