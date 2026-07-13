//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the combat frustration vessel in this instant, revealing
 * its focused js ai advanced memory service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Combat frustration memory.
 *
 * Chapter 91: the fighter may not become a statue beside an enemy. If the
 * Awtsmoos places an opponent within breath range and no blow is born, the bot
 * gathers a restless spark: cross through, step, jab, kick, anything lawful —
 * but never silent stillness beside danger.
 */
export function updateCombatFrustration(bot, world) {
	bot.aiMind ||= {};
	bot.aiMind.frustration ||= freshFrustration();
	const f = bot.aiMind.frustration;
	const near = nearEnemy(bot, world);
	const attacking = !!(
		bot.attack ||
		bot.rapidAttack ||
		bot.input?.punch ||
		bot.input?.kick ||
		bot.input?.grab ||
		bot.input?.rapidPunch
	);
	const moving = Math.abs(bot.vx || 0) > 0.6 || Math.abs(bot.input?.x || 0) > 0.15;
	f.nearEnemyFrames = near ? f.nearEnemyFrames + 1 : 0;
	f.noActionFrames = near && !attacking ? f.noActionFrames + 1 : 0;
	f.noMovementFrames = near && !moving ? f.noMovementFrames + 1 : 0;
	f.level = Math.min(100, f.noActionFrames * 1.6 + f.noMovementFrames * 1.2);
	f.side = Math.sign(world.target.x - bot.x || bot.face || 1);
	f.frustrated = f.nearEnemyFrames > 36 && (f.noActionFrames > 28 || f.noMovementFrames > 30);
	f.forceCrossUp = f.frustrated && f.noActionFrames > 44;
	f.forceJab = f.frustrated && f.noActionFrames > 34;
	f.forceStepThrough = f.frustrated && f.noMovementFrames > 38;
	return { ...f };
}

function nearEnemy(bot, world) {
	return Math.abs(world.target.x - bot.x) < 190 && Math.abs(world.target.y - bot.y) < 165;
}

function freshFrustration() {
	return {
		nearEnemyFrames: 0,
		noActionFrames: 0,
		noMovementFrames: 0,
		level: 0,
		side: 1,
		frustrated: false,
		forceCrossUp: false,
		forceJab: false,
		forceStepThrough: false
	};
}
