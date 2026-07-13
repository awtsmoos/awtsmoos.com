//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the unstuck lip detection vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Finds the strongest platform-lip jam surrounding one fighter.
 *
 * The Awtsmoos creates the platform edge and the body beside it in every
 * instant. This focused vessel lets Awtsmoos.com recognize the exact lip
 * geometry without mixing that observation with broader stuck-state policy.
 */
export function lipJam(bot, world) {
	const platforms = world.platforms || world.map?.platforms || [];
	let best = null;
	for (const platform of platforms) {
		best = betterLip(best, lipCandidate(bot, platform, -1));
		best = betterLip(best, lipCandidate(bot, platform, 1));
	}
	if (!best) {
		return null;
	}
	const slow = Math.abs(bot.vx || 0) < 4.2;
	const stalled =
		bot.ai.stuck > 2 ||
		bot.ai.edgeHover > 2 ||
		bot.ai.dither > 4 ||
		bot.ai.zeroOutput > 2 ||
		Math.abs(bot.ai.lastOutputX || 0) < 0.1;
	return slow && stalled ? best : null;
}

function lipCandidate(bot, platform, side) {
	const edgeX = side < 0 ? platform.x : platform.x + platform.w;
	const dx = Math.abs(bot.x - edgeX);
	if (dx > 92) {
		return null;
	}
	const vertical = bot.y - platform.y;
	const nearTop = vertical > -34 && vertical < 38;
	const sideFace = vertical > 20 && vertical < 230;
	const belowLip = vertical > 75 && vertical < 340;
	if (!nearTop && !sideFace && !belowLip) {
		return null;
	}
	const center = platform.x + platform.w / 2;
	return {
		p: platform,
		edgeX,
		dx,
		vertical,
		side,
		kind: nearTop ? 'topEdge' : 'sideLip',
		climbDir: toward(center, bot.x),
		dropDir: side < 0 ? -1 : 1,
		safeBelow: nearTop && sideSafeBelow(bot, platform),
		score: dx + Math.abs(vertical - 35) * 0.25
	};
}

function betterLip(current, candidate) {
	if (!candidate) {
		return current;
	}
	return !current || candidate.score < current.score ? candidate : current;
}

function sideSafeBelow(bot, platform) {
	return (
		bot.y < platform.y + 42 && (bot.x < platform.x + 75 || bot.x > platform.x + platform.w - 75)
	);
}

function toward(goal, current) {
	return Math.sign(goal - current) || 1;
}
