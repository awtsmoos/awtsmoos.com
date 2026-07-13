//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the opportunity fatigue vessel in this instant, revealing
 * its focused js ai advanced strategy service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Opportunity fatigue.
 *
 * Chapter 64: even a holy tactic becomes exile if it repeats without fruit.
 * The Awtsmoos lets edge pressure breathe, but if it chants the same name too
 * long without damage, approach, or movement, its crown dims until action wins.
 */
export function updateOpportunityFatigue(bot, world, scores) {
	bot.aiMind ||= {};
	bot.aiMind.fatigue ||= freshFatigue();
	const f = bot.aiMind.fatigue;
	const winner = topScore(scores);
	if (winner !== f.name) resetFatigue(f, winner, bot, world);
	else continueFatigue(f, bot, world);
	const multiplier = multiplierFor(f, winner);
	return {
		name: f.name,
		frames: f.frames,
		triggers: f.triggers,
		multiplier,
		stale: multiplier < 1
	};
}

/**
 * Reveals the apply opportunity fatigue behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} scores The scores value entering this behavior.
 * @param {*} fatigue The fatigue value entering this behavior.
 */
export function applyOpportunityFatigue(scores, fatigue) {
	if (!fatigue?.stale) return scores;
	return {
		...scores,
		[fatigue.name]: Math.round((scores[fatigue.name] || 0) * fatigue.multiplier)
	};
}

function continueFatigue(f, bot, world) {
	f.frames++;
	f.distanceGain += Math.max(
		0,
		(f.lastDistance ?? distance(bot, world.target)) - distance(bot, world.target)
	);
	f.movement += Math.hypot(bot.x - f.lastX, bot.y - f.lastY);
	f.damageGain += Math.max(0, world.target.damage - f.lastTargetDamage);
	f.lastDistance = distance(bot, world.target);
	f.lastTargetDamage = world.target.damage;
	f.lastX = bot.x;
	f.lastY = bot.y;
	if (shouldTrigger(f)) f.triggers++;
}

function resetFatigue(f, name, bot, world) {
	f.name = name;
	f.frames = 0;
	f.triggers = 0;
	f.distanceGain = 0;
	f.movement = 0;
	f.damageGain = 0;
	f.lastDistance = distance(bot, world.target);
	f.lastTargetDamage = world.target.damage;
	f.lastX = bot.x;
	f.lastY = bot.y;
}

function multiplierFor(f, name) {
	if (name === 'GuaranteedAttack') return 1;
	if (name === 'EdgePressure' && f.frames > 150 && shouldTrigger(f)) return 0.22;
	if (name === 'LandingIntercept' && f.frames > 120 && shouldTrigger(f)) return 0.45;
	if (f.frames > 240 && shouldTrigger(f)) return 0.55;
	return 1;
}

function shouldTrigger(f) {
	return f.damageGain < 1 && f.distanceGain < 70 && f.movement < 420;
}

function topScore(scores) {
	return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Chase';
}

function distance(bot, target) {
	return Math.hypot(target.x - bot.x, (target.y - bot.y) * 0.6);
}

function freshFatigue() {
	return {
		name: '',
		frames: 0,
		triggers: 0,
		distanceGain: 0,
		movement: 0,
		damageGain: 0,
		lastDistance: 0,
		lastTargetDamage: 0,
		lastX: 0,
		lastY: 0
	};
}
