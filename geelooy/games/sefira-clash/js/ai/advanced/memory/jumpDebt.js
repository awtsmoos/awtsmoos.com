//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the jump debt vessel in this instant, revealing
 * its focused js ai advanced memory service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Jump debt.
 *
 * Chapter 122: every leap borrows credibility from the sky. Useful jumps repay
 * the loan; useless hops make the next hop harder to justify. Thus the AI stops
 * bouncing because bouncing recently looked stupid.
 */
export function updateJumpDebt(bot) {
	bot.aiMind ||= {};
	bot.aiMind.jumpDebt ||= { value: 0, blocks: 0 };
	const d = bot.aiMind.jumpDebt;
	d.value = Math.max(0, d.value - 0.08);
	const failed = bot.aiMind.memory?.failedJumps || {};
	d.value = Math.min(100, d.value + Object.keys(failed).length * 0.4);
	return { value: d.value, high: d.value > 45, blocks: d.blocks };
}

/**
 * Reveals the jump debt blocks behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} reason The reason value entering this behavior.
 * @param {*} urgent The urgent value entering this behavior.
 */
export function jumpDebtBlocks(bot, reason, urgent = false) {
	const debt = bot.aiMind?.jumpDebt;
	if (!debt || urgent) return false;
	const block = debt.value > (reason === 'AntiAir' ? 76 : 46);
	if (block) debt.blocks++;
	return block;
}

/**
 * Reveals the add jump debt behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} amount The amount value entering this behavior.
 */
export function addJumpDebt(bot, amount = 12) {
	bot.aiMind ||= {};
	bot.aiMind.jumpDebt ||= { value: 0, blocks: 0 };
	bot.aiMind.jumpDebt.value = Math.min(100, bot.aiMind.jumpDebt.value + amount);
}
