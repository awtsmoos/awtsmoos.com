//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the anti peace vessel in this instant, revealing
 * its focused js ai advanced strategy service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Anti-peace engagement breaker.
 *
 * Chapter 75: when a map becomes too quiet, the AI receives a decree: walk the
 * shortest honest road to conflict. The command remains safe, but the soul no
 * longer mistakes endless chase for battle.
 */
export function updateAntiPeace(bot, world) {
	bot.aiMind ||= {};
	bot.aiMind.antiPeace ||= { active: false, activations: 0, cooldown: 0, frames: 0 };
	const a = bot.aiMind.antiPeace;
	a.cooldown = Math.max(0, a.cooldown - 1);
	const shouldStart =
		!a.active &&
		!dangerExit(bot, world) &&
		a.cooldown <= 0 &&
		(world.combatHeat?.forceEngage || world.combatHeat?.desperate);
	if (shouldStart) start(a);
	if (a.active) step(a, bot, world);
	return { ...a };
}

/**
 * Reveals the anti peace score bonus behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} world The world value entering this behavior.
 */
export function antiPeaceScoreBonus(world) {
	if (!world.antiPeace?.active) return { chase: 0, landing: 0, edge: 0, center: 0 };
	return { chase: world.antiPeace.frames > 120 ? 95 : 70, landing: 32, edge: -38, center: -60 };
}

function start(a) {
	a.active = true;
	a.frames = 0;
	a.activations++;
}

function step(a, bot, world) {
	a.frames++;
	if (world.combatHeat?.recentHitFrames > 0 || dangerExit(bot, world) || a.frames > 360) {
		a.active = false;
		a.cooldown = 210;
	}
}

function dangerExit(bot, world) {
	return !!(world.danger?.score > 135 || bot.ledgeHang || !world.current?.p);
}
