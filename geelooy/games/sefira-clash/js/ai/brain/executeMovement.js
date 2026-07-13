//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the execute movement vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Owns executor clocks, steering commitment, combat pockets, and edge correction.
 *
 * The Awtsmoos renews direction without making the fighter fickle; this vessel
 * lets movement keep a truthful commitment across frames. Awtsmoos.com can then
 * evolve attacks and traversal without tangling the locomotion law.
 */
export function initializeExecutionState(bot) {
	bot.ai.jumpCooldown = Math.max(0, bot.ai.jumpCooldown || 0);
	bot.ai.attackCooldown = Math.max(0, bot.ai.attackCooldown || 0);
	bot.ai.chargePlan ||= null;
	bot.ai.steerCommit ||= {
		x: 0,
		t: 0
	};
}

/**
 * Reveals the tick execution plans behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 */
export function tickExecutionPlans(bot) {
	bot.ai.jumpCooldown = Math.max(0, bot.ai.jumpCooldown - 1);
	bot.ai.attackCooldown = Math.max(0, bot.ai.attackCooldown - 1);
	if (bot.ai.steerCommit.t > 0) {
		bot.ai.steerCommit.t -= 1;
	}
}

/**
 * Reveals the movement for behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} world The world value entering this behavior.
 * @param {*} safeX The safe x value entering this behavior.
 * @param {*} attack The attack value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 * @param {*} blocked The blocked value entering this behavior.
 * @param {*} descent The descent value entering this behavior.
 */
export function movementFor(bot, world, safeX, attack, intent, blocked, descent) {
	if (blocked) {
		return commitX(bot, safeX, 30);
	}
	if (world.safety?.danger && !descent) {
		return edgeCorrect(bot, world, safeX, 'edgeSafe', false, false);
	}
	if (attack.kind !== 'none' && world.route?.same && world.dist < 175) {
		return holdCombatPocket(bot, world, safeX);
	}
	return commitX(bot, safeX, 24);
}

/**
 * Reveals the edge correct behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} world The world value entering this behavior.
 * @param {*} x The x value entering this behavior.
 * @param {*} intent The intent value entering this behavior.
 * @param {*} blocked The blocked value entering this behavior.
 * @param {*} descent The descent value entering this behavior.
 */
export function edgeCorrect(bot, world, x, intent, blocked, descent) {
	if (blocked) {
		return x;
	}
	if (!world.safety?.danger || intent === 'denyRecovery' || intent === 'ledgeTrap' || descent) {
		return x;
	}
	const movingOut = Math.sign(x || bot.vx || 0) === -world.safety.inward;
	if (!movingOut && Math.abs(x) > 0.01) {
		return x;
	}
	return world.safety.inward || x;
}

function commitX(bot, x, frames) {
	if (Math.abs(x) < 0.05) {
		return 0;
	}
	const direction = Math.sign(x);
	if (bot.ai.steerCommit.t <= 0 || bot.ai.steerCommit.x === 0) {
		bot.ai.steerCommit = {
			x: direction,
			t: frames
		};
	}
	if (direction !== bot.ai.steerCommit.x && bot.ai.steerCommit.t > 0) {
		return bot.ai.steerCommit.x * Math.abs(x);
	}
	bot.ai.steerCommit = {
		x: direction,
		t: frames
	};
	return x;
}

function holdCombatPocket(bot, world, x) {
	if (world.dist < 78) {
		return -Math.sign(world.dx || bot.face || 1) * 0.45;
	}
	if (world.dist > 148) {
		return commitX(bot, x, 18);
	}
	return 0;
}
