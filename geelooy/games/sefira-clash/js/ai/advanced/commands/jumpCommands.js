/**
 * B"H
 * Jump command gate with debt.
 *
 * Chapter 132: a jump now needs a reason and a clean account. Recovery and real
 * anti-air may still leap, but repeated useless hopping accrues debt and gets
 * blocked before it becomes comedy.
 */
import { classifyJumpReason, jumpDecision, jumpGap } from '../navigation/jumpDiscipline.js';
import { rememberIssuedJump } from '../memory/actionMemory.js';
import { addJumpDebt, jumpDebtBlocks } from '../memory/jumpDebt.js';

export function maybeApplyJump(bot, world, out, mode) {
  const reason = classifyJumpReason(mode, world);
  const decision = jumpDecision(bot, world, reason);
  const urgent = mode === 'RecoverLow' || mode === 'RecoverHigh' || world.combat?.shouldAntiAir;
  const blocked = poisonedJump(bot, world, mode) || jumpDebtBlocks(bot, reason, urgent);
  bot.aiMind.jumpReason = blocked ? blockedReason(bot, world) : decision.allow ? reason : decision.reason;
  if (blocked || !decision.allow || !needsJump(mode, world)) return;
  out.jump = true;
  bot.aiMind.lastJumpAt = bot.aiMind.clock || 0;
  bot.aiMind.lastJumpAtByReason ||= {};
  bot.aiMind.lastJumpAtByReason[reason] = bot.aiMind.clock || 0;
  bot.jumpMemory ||= { wasJumping: false, hold: 0 };
  bot.jumpMemory.wasJumping = false;
  addJumpDebt(bot, reason === 'AntiAir' ? 5 : 10);
  rememberIssuedJump(bot, reason, bot.x, bot.y);
}

function blockedReason(bot, world) {
  if (world.edgePoison?.blocked) return 'poisonedEdge';
  if (bot.aiMind?.jumpDebt?.value > 0) return 'jumpDebt';
  return 'blocked';
}

function poisonedJump(bot, world, mode) {
  if (!world.edgePoison?.blocked) return false;
  if (mode === 'RecoverLow' || mode === 'RecoverHigh') return false;
  if (world.combat?.shouldAntiAir) return false;
  return mode?.startsWith('Escape') || mode === 'PlatformAscend';
}

function needsJump(mode, world) {
  if (mode === 'RecoverLow') return true;
  if (mode?.startsWith('Escape')) return true;
  if (mode === 'PlatformAscend') return Math.abs((world.step?.targetX ?? world.goal.safe.center) - world.target.x) < 900;
  if (world.combat?.shouldAntiAir && !world.combat?.sameFightingLane) return true;
  return false;
}

export { jumpGap };
