/**
 * B"H
 * Jump command gate.
 * Chapter 47: a leap is stamped with reason, cooldown, and memory.
 */
import { classifyJumpReason, jumpDecision, jumpGap } from '../navigation/jumpDiscipline.js';
import { rememberIssuedJump } from '../memory/actionMemory.js';

export function maybeApplyJump(bot, world, out, mode) {
  const reason = classifyJumpReason(mode, world);
  const decision = jumpDecision(bot, world, reason);
  bot.aiMind.jumpReason = decision.allow ? reason : decision.reason;
  if (!decision.allow || !needsJump(mode, world)) return;
  out.jump = true;
  bot.aiMind.lastJumpAt = bot.aiMind.clock || 0;
  bot.aiMind.lastJumpAtByReason ||= {};
  bot.aiMind.lastJumpAtByReason[reason] = bot.aiMind.clock || 0;
  bot.jumpMemory ||= { wasJumping: false, hold: 0 };
  bot.jumpMemory.wasJumping = false;
  rememberIssuedJump(bot, reason, bot.x, bot.y);
}

function needsJump(mode, world) {
  if (mode === 'RecoverLow') return true;
  if (mode?.startsWith('Escape')) return true;
  if (mode === 'PlatformAscend') return Math.abs((world.step?.targetX ?? world.goal.safe.center) - world.target.x) < 900;
  if (world.combat?.shouldAntiAir && !world.combat?.sameFightingLane) return true;
  return false;
}

export { jumpGap };
