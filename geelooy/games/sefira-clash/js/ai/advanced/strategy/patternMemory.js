//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the pattern memory vessel in this instant, revealing
 * its focused js ai advanced strategy service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Lightweight enemy habit memory.
 *
 * Chapter 53: the bot remembers only human-sized habits: jumping, charging,
 * retreating toward edge, and dropping platforms. No heavy learning, just bias.
 */
export function updatePatternMemory(bot, target, world) {
	bot.aiMind ||= {};
	bot.aiMind.patterns ||= {};
	const key = target.id;
	const p = (bot.aiMind.patterns[key] ||= fresh());
	decay(p);
	if (!target.grounded) p.jumpRate += 0.025;
	if (world.motion?.charging) p.chargeRate += 0.035;
	if (world.edgePressure?.score > 0.45 && Math.sign(target.vx || 0) === world.edgePressure.side)
		p.edgeRetreatRate += 0.03;
	if (target.dropTimer > 0 || target.lastInput?.down) p.platformDropRate += 0.025;
	clampAll(p);
	return p;
}

function fresh() {
	return { jumpRate: 0, chargeRate: 0, edgeRetreatRate: 0, platformDropRate: 0 };
}

function decay(p) {
	p.jumpRate *= 0.995;
	p.chargeRate *= 0.994;
	p.edgeRetreatRate *= 0.996;
	p.platformDropRate *= 0.996;
}

function clampAll(p) {
	for (const key of Object.keys(p)) p[key] = Math.max(0, Math.min(1, p[key]));
}
