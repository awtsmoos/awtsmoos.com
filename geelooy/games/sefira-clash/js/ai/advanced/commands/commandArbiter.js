import { validateAttack } from '../combat/attackValidator.js';
import { chooseCommitment } from '../combat/commitmentPlanner.js';
import { updateActionMemory } from '../memory/actionMemory.js';
import { chooseOpportunity } from '../strategy/opportunityModel.js';
import { updatePressure } from '../strategy/pressureBudget.js';
import { applyAttackCommand, clearChargeOutsideAttack } from './attackCommands.js';
import { maybeApplyJump } from './jumpCommands.js';
import { ascendCommand, baseCommand, chaseCommand, descendCommand, escapeCommand, recoverCommand } from './moveCommands.js';
import { applyStrategyCommand } from './strategyCommands.js';

/**
 * B"H
 * Command arbiter with force-engage priority.
 *
 * Chapter 90: platform routing may no longer keep a peaceful map peaceful. If
 * the bot is safe and no valid attack exists, anti-peace can interrupt ordinary
 * ascends/descends and walk straight toward collision. Recovery and escape keep
 * the throne of survival; valid attack keeps the throne of violence.
 */
export function commandForState(bot, world, mode, stuck) {
  stepButtonClock(bot);
  const memory = updateActionMemory(bot, world);
  const attackCheck = validateAttack(bot, world, world.combatTactic);
  const pressure = updatePressure(bot, world, attackCheck);
  world.pressure = pressure;
  const opportunity = chooseOpportunity(bot, world, attackCheck);
  const commitment = chooseCommitment(bot, { ...world, opportunity, pressure }, mode, attackCheck);
  const out = baseCommand(bot, world);
  clearChargeOutsideAttack(bot, mode);
  applyMode(bot, world, out, mode, stuck, attackCheck, commitment, opportunity);
  maybeApplyJump(bot, world, out, mode);
  return remember(bot, out, attackCheck, commitment, memory, opportunity, pressure);
}

function applyMode(bot, world, out, mode, stuck, attackCheck, commitment, opportunity) {
  if (mode === 'RecoverHigh') return recoverCommand(bot, world, out, false);
  if (mode === 'RecoverLow') return recoverCommand(bot, world, out, true);
  if (mode.startsWith('Escape')) return escapeCommand(bot, world, out, stuck);
  if (attackCheck.valid || mode === 'Attack') return applyAttackCommand(bot, world, out, attackCheck, commitment);
  if (shouldForceStrategy(world, opportunity) && applyStrategyCommand(bot, world, out, opportunity)) return;
  if (mode === 'PlatformAscend') return ascendCommand(bot, world, out);
  if (mode === 'PlatformDescend') return descendCommand(bot, world, out);
  if (applyStrategyCommand(bot, world, out, opportunity)) return;
  chaseCommand(bot, world, out);
}

function shouldForceStrategy(world, opportunity) {
  return !!(world.antiPeace?.active || world.combatHeat?.forceEngage || opportunity.intent === 'ForceApproach' || opportunity.intent === 'ComboContinue');
}

function stepButtonClock(bot) {
  bot.aiMind ||= {};
  bot.aiMind.buttonClock ||= { punch: 0, kick: 0, grab: 0 };
  for (const key of Object.keys(bot.aiMind.buttonClock)) bot.aiMind.buttonClock[key] = Math.max(0, bot.aiMind.buttonClock[key] - 1);
}

function remember(bot, out, attackCheck, commitment, memory, opportunity, pressure) {
  bot.aiMind.lastOutputX = out.x || 0;
  bot.aiMind.attackCheck = attackCheck;
  bot.aiMind.commitment = commitment;
  bot.aiMind.memory = memory;
  bot.aiMind.opportunity = opportunity;
  bot.aiMind.pressure = pressure;
  bot.aiMind.tactic = out.rapidPunch ? 'RapidPunch' : out.grab ? 'Grab' : out.kick ? 'Kick' : out.punch ? 'Punch' : out.chargeKick ? 'ChargeKick' : out.chargePunch ? 'ChargePunch' : commitment.name;
  return sanitize(out);
}

function sanitize(out) {
  out.x = clamp(out.x || 0, -1, 1);
  out.y = clamp(out.y || 0, -1, 1);
  return out;
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
