//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the jump commands vessel in this instant, revealing
 * its focused js ai advanced commands service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Jump command gate with dive setup.
 *
 * Chapter 95: jumps remain disciplined, but now one sacred exception appears:
 * leap over the target so the next downward vow can crush the head.
 */
import { classifyJumpReason, jumpDecision, jumpGap } from '../navigation/jumpDiscipline.js';
import { purposefulJump } from '../navigation/jumpPurpose.js';
import { rememberIssuedJump } from '../memory/actionMemory.js';
import { addJumpDebt, jumpDebtBlocks } from '../memory/jumpDebt.js';

/**
 * Reveals the maybe apply jump behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} world The world value entering this behavior.
 * @param {*} out The out value entering this behavior.
 * @param {*} mode The mode value entering this behavior.
 */
export function maybeApplyJump(bot, world, out, mode) {
	const reason =
		world.dive?.kind === 'setupJump' ? 'DiveSetupJump' : classifyJumpReason(mode, world);
	const purpose =
		world.dive?.kind === 'setupJump'
			? { allow: true, reason: 'diveSetup' }
			: purposefulJump(bot, world, mode, reason);
	const decision =
		world.dive?.kind === 'setupJump'
			? { allow: true, reason: 'diveSetup' }
			: jumpDecision(bot, world, reason);
	const urgent =
		mode === 'RecoverLow' ||
		mode === 'RecoverHigh' ||
		world.threatVision?.panic ||
		reason === 'DiveSetupJump';
	const blocked = poisonedJump(bot, world, mode) || jumpDebtBlocks(bot, reason, urgent);
	bot.aiMind.jumpReason = blocked
		? blockedReason(bot, world)
		: !purpose.allow
			? purpose.reason
			: decision.allow
				? purpose.reason
				: decision.reason;
	if (blocked || !purpose.allow || !decision.allow || !needsJump(mode, world, reason)) return;
	out.jump = true;
	rememberJump(bot, reason);
}

function rememberJump(bot, reason) {
	bot.aiMind.lastJumpAt = bot.aiMind.clock || 0;
	bot.aiMind.lastJumpAtByReason ||= {};
	bot.aiMind.lastJumpAtByReason[reason] = bot.aiMind.clock || 0;
	bot.jumpMemory ||= { wasJumping: false, hold: 0 };
	bot.jumpMemory.wasJumping = false;
	addJumpDebt(bot, reason === 'AntiAirJump' || reason === 'DiveSetupJump' ? 5 : 12);
	rememberIssuedJump(bot, reason, bot.x, bot.y);
}
function blockedReason(bot, world) {
	if (world.edgePoison?.blocked) return 'poisonedEdge';
	if (bot.aiMind?.jumpDebt?.value > 0) return 'jumpDebt';
	return 'blocked';
}
function poisonedJump(bot, world, mode) {
	if (!world.edgePoison?.blocked) return false;
	if (mode === 'RecoverLow' || mode === 'RecoverHigh' || world.dive?.kind === 'setupJump')
		return false;
	if (world.combat?.shouldAntiAir) return false;
	return mode?.startsWith('Escape') || mode === 'PlatformAscend';
}
function needsJump(mode, world, reason) {
	if (reason === 'DiveSetupJump') return true;
	if (mode === 'RecoverLow') return true;
	if (mode?.startsWith('Escape')) return true;
	if (mode === 'PlatformAscend')
		return Math.abs((world.step?.targetX ?? world.goal.safe.center) - world.target.x) < 900;
	if (world.combat?.shouldAntiAir && !world.combat?.sameFightingLane) return true;
	return false;
}
export { jumpGap };
