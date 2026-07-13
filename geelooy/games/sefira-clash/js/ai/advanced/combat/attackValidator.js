//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the attack validator vessel in this instant, revealing
 * its focused js ai advanced combat service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Attack validity gate.
 *
 * Chapter 228: the gate remains honest, but no longer timid. A bot may perform
 * a lawful pressure swing while closing if the enemy is in the fighting lane and
 * not truly walled off. Aggression becomes continuous without counting nonsense
 * as valid.
 */
export function validateAttack(bot, world, tactic) {
	const target = world.target;
	const memory = bot.aiMind?.memory || {};
	const predicted = predictTarget(target, startupFor(tactic));
	const dx = predicted.x - bot.x;
	const dy = predicted.y - bot.y;
	const facing = Math.sign(dx || bot.face || 1) === Math.sign(tactic.aimX || bot.face || 1);
	const lane = Math.abs(dy) < laneHeight(tactic, world);
	const range = Math.abs(dx) < rangeFor(tactic, bot, world);
	const pressure = pressureRange(dx, dy, world, tactic);
	const whiff = memory.whiffs?.[tactic.kind] || 0;
	const blocked = world.wall?.blocked && Math.abs(dx) > blockTolerance(world);
	const valid =
		facing && lane && (range || pressure) && !blocked && whiff < whiffTolerance(world);
	return {
		valid,
		predicted,
		facing,
		lane,
		range: range || pressure,
		pressure,
		blocked,
		whiff,
		reason: reason(valid, facing, lane, range, pressure, blocked, whiff)
	};
}

/**
 * Reveals the attack key behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} world The world value entering this behavior.
 */
export function attackKey(world) {
	return world.combatTactic?.kind || 'Attack';
}

function predictTarget(target, frames) {
	return { x: target.x + (target.vx || 0) * frames, y: target.y + (target.vy || 0) * frames };
}

function startupFor(tactic) {
	if (tactic.instant) return tactic.button === 'grab' ? 7 : 4;
	if (tactic.charge || tactic.kind?.includes('Charge')) return 14;
	return 6;
}

function rangeFor(tactic, bot, world) {
	const kill = world.koIntent?.killReady ? 18 : 0;
	if (tactic.button === 'grab') return 104;
	if (tactic.button === 'kick' || tactic.kind?.includes('Kick'))
		return (bot.attack ? 168 : 156) + kill;
	if (tactic.charge || tactic.kind?.includes('Charge')) return 198 + kill;
	if (tactic.family === 'rapid') return 142;
	return 142 + kill;
}

function laneHeight(tactic, world) {
	if (tactic.family === 'antiAir' || tactic.kind === 'AntiAir' || world.combat?.shouldAntiAir)
		return 255;
	if (Math.abs(tactic.aimY || 0) > 0.4) return 220;
	return world.koIntent?.killReady ? 158 : 145;
}

function pressureRange(dx, dy, world, tactic) {
	if (world.wall?.blocked && Math.abs(dx) > 120) return false;
	if (Math.abs(dy) > 175) return false;
	const aggressive =
		world.hunger?.starving ||
		world.combatHeat?.forceEngage ||
		world.antiPeace?.active ||
		world.koIntent?.name === 'EdgeCarry' ||
		world.koIntent?.name === 'HorizontalKill';
	if (!aggressive && !world.combat?.sameFightingLane) return false;
	const limit = tactic.charge ? 230 : tactic.button === 'kick' ? 220 : 190;
	return Math.abs(dx) < limit;
}

function blockTolerance(world) {
	return world.koIntent?.killReady || world.combatHeat?.forceEngage ? 155 : 105;
}

function whiffTolerance(world) {
	return world.combatHeat?.forceEngage || world.hunger?.starving ? 88 : 62;
}

function reason(valid, facing, lane, range, pressure, blocked, whiff) {
	if (valid) return pressure && !range ? 'pressureValid' : 'valid';
	if (!facing) return 'wrongFace';
	if (!lane) return 'wrongLane';
	if (!range && !pressure) return 'outOfRange';
	if (blocked) return 'wallBlocked';
	if (whiff >= 62) return 'recentWhiff';
	return 'invalid';
}
