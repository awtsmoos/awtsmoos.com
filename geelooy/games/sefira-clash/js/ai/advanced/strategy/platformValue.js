//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the platform value vessel in this instant, revealing
 * its focused js ai advanced strategy service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Tiny platform value scorer.
 *
 * Chapter 52: no territory empire is built here. Each platform receives only a
 * humble score: near landing, near center, useful for return path, dangerous if
 * the bot is wounded near a lip.
 */
export function bestPlatformValue(bot, world, landing) {
	let best = null;
	for (const node of world.graph.nodes) {
		const value = scorePlatform(bot, world, node.p, landing);
		if (!best || value > best.value)
			best = { node, platform: node.p, value, standX: standX(node.p, world, landing) };
	}
	return (
		best || {
			node: world.current,
			platform: world.current.p,
			value: 0,
			standX: world.current.safe.center
		}
	);
}

function scorePlatform(bot, world, p, landing) {
	const center = p.x + p.w / 2;
	const mapCenter = (world.map.bounds.left + world.map.bounds.right) / 2;
	const landingBonus = landing?.active
		? 260 - Math.abs(center - landing.x) * 0.35 - Math.abs(p.y - landing.y) * 0.18
		: 0;
	const targetBonus = 160 - Math.abs(center - world.target.x) * 0.18;
	const centerBonus = 70 - Math.abs(center - mapCenter) * 0.04;
	const ledgePenalty = bot.damage > 85 && nearLedge(bot, p) ? 120 : 0;
	return landingBonus + targetBonus + centerBonus - ledgePenalty;
}

function standX(p, world, landing) {
	const goal = landing?.active ? landing.x : world.target.x;
	return clamp(goal, p.x + 70, p.x + p.w - 70);
}

function nearLedge(bot, p) {
	return Math.abs(bot.x - p.x) < 130 || Math.abs(bot.x - (p.x + p.w)) < 130;
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
