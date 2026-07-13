//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the action taste memory vessel in this instant, revealing
 * its focused js ai advanced memory service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Action taste memory.
 *
 * Chapter 121: the bot gains the human shame of looking stupid. Actions that
 * recently failed taste bitter; actions that made contact taste sweet. This is
 * not deep learning — just not repeating the same nonsense forever.
 */
export function updateActionTaste(bot) {
	bot.aiMind ||= {};
	bot.aiMind.taste ||= { bitter: {}, sweet: {}, whiffFrames: 0 };
	const t = bot.aiMind.taste;
	decay(t.bitter, 0.985);
	decay(t.sweet, 0.992);
	const mem = bot.aiMind.memory;
	for (const key of Object.keys(mem?.whiffs || {}))
		t.bitter[key] = Math.max(t.bitter[key] || 0, mem.whiffs[key]);
	if (mem?.lastAttackHit && bot.aiMind.tactic)
		t.sweet[bot.aiMind.tactic] = Math.min(100, (t.sweet[bot.aiMind.tactic] || 0) + 12);
	t.whiffFrames = Object.keys(mem?.whiffs || {}).length
		? t.whiffFrames + 1
		: Math.max(0, t.whiffFrames - 2);
	return { ...t };
}

/**
 * Reveals the taste penalty behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} key The key value entering this behavior.
 */
export function tastePenalty(bot, key) {
	return bot.aiMind?.taste?.bitter?.[key] || 0;
}

function decay(map, factor) {
	for (const key of Object.keys(map)) {
		map[key] *= factor;
		if (map[key] < 1) delete map[key];
	}
}
