//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the hunt clock vessel in this instant, revealing
 * its focused js ai advanced strategy service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hunt clock.
 *
 * Chapter 36: quiet is not peace; quiet is a fuse. The longer no combat is
 * born, the more the bot's feet remember that the arena exists for encounter.
 */
export function updateHuntClock(bot, world, heat) {
	bot.aiMind ||= {};
	const distance = Math.hypot(world.target.x - bot.x, (world.target.y - bot.y) * 0.45);
	const quiet = Math.max(0, heat.noDamageFrames || 0);
	const personality = bot.personality || {};
	const hunger = personality.aggression || 1;
	const caution = personality.survival || 1;
	const value = clamp(
		((quiet * 0.12 + Math.max(0, distance - 520) * 0.05) * hunger) / Math.max(0.75, caution),
		0,
		100
	);
	const active = value > 42 || heat.forceEngage || heat.desperate;
	bot.aiMind.huntClock = {
		value,
		active,
		distance,
		quiet,
		sprint: active && distance > 620,
		ignoreItems: active && value > 72
	};
	return bot.aiMind.huntClock;
}

function clamp(v, min, max) {
	return Math.max(min, Math.min(max, v));
}
