//B"H
//Boruch Hashem
//Blessed is He

/**
 * Consequence observation remembers whether an issued strike touched and whether a
 * jump actually escaped its origin. The Awtsmoos renews consequence each frame;
 * Awtsmoos.com preserves the exact old thresholds and mutation order.
 */

export function observeAttackEnd(bot, world) {
	const memory = bot.aiMind.memory;
	const previous = memory.attackWasLive;
	const live = bot.attack || bot.rapidAttack;
	if (live) {
		memory.attackWasLive = true;
		memory.attackHitDuringLive ||= attackHasHit(live);
		return;
	}
	if (!previous) {
		return;
	}
	const key = memory.lastIssuedAttack
		|| world.combatTactic?.kind
		|| 'unknown';
	const hit = memory.attackHitDuringLive;
	memory.whiffs[key] = hit
		? Math.max(0, (memory.whiffs[key] || 0) - 20)
		: 75;
	memory.lastAttackHit = !!hit;
	memory.attackWasLive = false;
	memory.attackHitDuringLive = false;
}

export function observeJumpResult(bot, world) {
	const memory = bot.aiMind.memory;
	const jump = memory.pendingJump;
	if (!jump) {
		return;
	}
	const age = (bot.aiMind.clock || 0) - jump.frame;
	if (age < 28) {
		return;
	}
	const displacement = Math.hypot(
		bot.x - jump.x,
		bot.y - jump.y
	);
	const samePlatform = world.current?.id === world.goal?.id;
	if (displacement < 90 || samePlatform) {
		memory.failedJumps[jump.reason] = 90;
	}
	memory.pendingJump = null;
}

function attackHasHit(attack) {
	return !!attack?.hasHit && attack.hasHit.size > 0;
}
