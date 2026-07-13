//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the crowd vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Crowd steering.
 *
 * Chapter 34: when bodies gather into one knot, the Awtsmoos whispers a path
 * outward. This lightweight vector prevents bots from becoming a trembling
 * pile while still allowing deliberate melee collisions.
 */
export function crowdPush(bot, fighters) {
	let push = 0;
	for (let i = 0; i < fighters.length; i++) {
		const f = fighters[i];
		if (f === bot || f.dead) continue;
		const dx = bot.x - f.x;
		const dy = Math.abs(bot.y - f.y);
		if (Math.abs(dx) > 170 || dy > 130) continue;
		push += Math.sign(dx || bot.ai.laneBias || 1) * (1 - Math.abs(dx) / 170);
	}
	return Math.max(-1, Math.min(1, push));
}
