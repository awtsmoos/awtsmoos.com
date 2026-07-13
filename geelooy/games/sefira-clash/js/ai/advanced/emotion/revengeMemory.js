//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the revenge memory vessel in this instant, revealing
 * its focused js ai advanced emotion service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Revenge memory.
 *
 * Chapter 116: a real fighter remembers the hand that struck him. Not forever,
 * not foolishly, but for a few seconds the last attacker burns brighter in the
 * target list and the mind turns with personal intent.
 */
export function updateRevengeMemory(bot) {
	bot.aiMind ||= {};
	bot.aiMind.revenge ||= { targetId: null, frames: 0, switches: 0 };
	const r = bot.aiMind.revenge;
	const attackerId = bot.ai?.lastAttacker || null;
	if (attackerId && attackerId !== r.targetId) {
		r.targetId = attackerId;
		r.frames = 300;
		r.switches++;
	} else if (r.frames > 0) r.frames--;
	if (!r.frames) r.targetId = null;
	return { ...r, active: !!r.targetId };
}

/**
 * Reveals the revenge target bonus behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} target The target value entering this behavior.
 */
export function revengeTargetBonus(bot, target) {
	const r = bot.aiMind?.revenge;
	return r?.targetId === target.id && r.frames > 0 ? 220 : 0;
}
