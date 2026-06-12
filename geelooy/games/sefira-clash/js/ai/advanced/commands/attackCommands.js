/**
 * B"H
 * Attack command helpers.
 *
 * Chapter 230: a charge plan may no longer become silence. If the corridor for
 * charged thunder is not viable, the bot converts immediately into kick or jab
 * pressure so valid attack frames always produce violence.
 */
import { applyChargePlan, cancelCharge } from '../combat/chargeController.js';
import { rememberIssuedAttack } from '../memory/actionMemory.js';

export function applyAttackCommand(bot, world, out, attackCheck, commitment) {
  if (!attackCheck.valid) return approachInstead(bot, world, out);
  const tactic = strikeTactic(bot, world, world.combatTactic);
  const pocket = world.combatPocket;
  out.aimX = tactic.aimX || pocket.aimX;
  out.aimY = tactic.aimY ?? pocket.aimY ?? 0;
  out.y = out.aimY;
  out.x = combatFootwork(bot, world, pocket, commitment);
  if (tactic.family === 'rapid') return rapid(bot, out, tactic);
  if (tactic.charge) return chargeOrPressure(bot, world, out, tactic);
  return instant(bot, world, out, tactic);
}

export function clearChargeOutsideAttack(bot, mode) {
  if (!mode?.startsWith('Attack')) cancelCharge(bot);
}

function strikeTactic(bot, world, tactic = {}) {
  if (tactic.button && tactic.button !== 'none') return tactic;
  const facing = Math.sign(world.target.x - bot.x || bot.face || 1);
  if (world.koIntent?.name === 'VerticalKill' || world.combat?.shouldAntiAir) return fallback('FallbackAntiAir', 'punch', facing * 0.18, -1, 'antiAir');
  if (world.koIntent?.name === 'HorizontalKill' || world.target.damage > 105) return fallback('FallbackKillKick', 'kick', world.launchPlan?.aimX || facing, world.launchPlan?.aimY || -0.08, 'kick');
  if (world.target.blocking) return fallback('FallbackGrab', 'grab', facing, 0, 'grab');
  return fallback('FallbackJab', 'punch', facing, 0, 'jab');
}

function fallback(kind, button, aimX, aimY, family) {
  return { kind, button, aimX, aimY, instant: true, fallback: true, family };
}

function approachInstead(bot, world, out) {
  const goal = world.predatorGoal?.x ?? world.combatPocket?.standX ?? world.target.x;
  out.x = Math.sign(goal - bot.x || world.target.x - bot.x || 1);
  out.aimX = Math.sign(world.target.x - bot.x || 1);
}

function chargeOrPressure(bot, world, out, tactic) {
  if (!chargeViable(world, tactic)) return instant(bot, world, out, chargeFallback(tactic, world));
  rememberIssuedAttack(bot, tactic.kind);
  applyChargePlan(bot, world, { ...tactic, button: tactic.button === 'kick' ? 'kick' : 'punch' }, out);
}

function chargeViable(world, tactic) {
  if (!world.combat?.sameFightingLane) return false;
  if (world.combat?.reachableClose) return true;
  if (world.combat?.canHitNow) return true;
  if (world.edgePressure?.score > 0.32 && Math.abs(world.target.x - (world.prediction?.x || world.target.x)) < 210) return true;
  if (tactic.family === 'chargeKick' && world.koIntent?.name === 'HorizontalKill') return true;
  return false;
}

function chargeFallback(tactic, world) {
  const button = tactic.button === 'kick' || tactic.family === 'chargeKick' ? 'kick' : 'punch';
  return { ...tactic, kind: `${tactic.kind}:PressureFallback`, family: button === 'kick' ? 'kick' : 'jab', button, instant: true, charge: false, aimX: world.launchPlan?.aimX || tactic.aimX || 1, aimY: world.launchPlan?.aimY ?? tactic.aimY ?? 0 };
}

function instant(bot, world, out, tactic) {
  const button = tactic.button === 'none' ? 'punch' : tactic.button;
  if (!canPulse(bot, button)) return keepThreatening(bot, world, out, tactic);
  rememberIssuedAttack(bot, tactic.kind);
  if (button === 'grab') out.grab = pulse(bot, 'grab', 14);
  else if (button === 'kick') out.kick = pulse(bot, 'kick', killGap(world, 8, 11));
  else out.punch = pulse(bot, 'punch', killGap(world, 5, 8));
}

function keepThreatening(bot, world, out, tactic) {
  if (!world.combatHeat?.forceEngage && !world.koIntent?.killReady) return;
  const button = tactic.button === 'kick' ? 'kick' : 'punch';
  if (button === 'kick') out.kick = true;
  else out.punch = true;
  rememberIssuedAttack(bot, `${tactic.kind}:ThreatHold`);
}

function rapid(bot, out, tactic) {
  if (!canPulse(bot, 'punch')) return;
  rememberIssuedAttack(bot, tactic.kind || 'RapidPressure');
  out.rapidPunch = true;
  out.punch = pulse(bot, 'punch', 4);
}

function combatFootwork(bot, world, pocket, commitment) {
  const dx = world.target.x - bot.x;
  if (world.predatorGoal?.distance > 30 && !world.combat.reachableClose) return world.predatorGoal.moveX;
  if (world.combat.reachableClose) return closeFootwork(dx, commitment, world);
  if (Math.abs(dx) < 110 && world.combat.sameFightingLane) return 0;
  return Math.sign((pocket?.standX ?? world.target.x) - bot.x || dx || 1);
}

function closeFootwork(dx, commitment, world) {
  if (world.koIntent?.name === 'EdgeCarry' || world.koIntent?.name === 'HorizontalKill') return Math.sign(world.launchPlan?.aimX || dx || 1) * 0.12;
  if (commitment.name === 'ComboContinue' || commitment.name === 'ForceApproach') return Math.sign(dx || 1) * 0.12;
  return -Math.sign(dx || 1) * 0.12;
}

function killGap(world, hot, normal) {
  return world.koIntent?.killReady || world.combatHeat?.forceEngage ? hot : normal;
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
