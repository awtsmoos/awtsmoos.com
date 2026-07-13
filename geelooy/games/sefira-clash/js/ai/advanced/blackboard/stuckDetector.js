//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the stuck detector vessel in this instant, revealing
 * its focused js ai advanced blackboard service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Stuck and oscillation detector.
 *
 * Chapter 241: distance from the target is not failure. A bot is only stuck
 * when its body is physically trapped: poisoned lip, true wall prison, repeated
 * oscillation, or near-enemy idleness. Ordinary pursuit remains pursuit.
 */
export function diagnoseStuck(bot, world, progress) {
	const samples = bot.aiMind?.samples || [];
	const loop = bot.aiMind?.positionLoop;
	const stateLoop = hasStateLoop(samples);
	const dirLoop = hasDirectionLoop(samples);
	const lip = nearPlatformLip(bot, world.platforms || []);
	const wall = trueWallPrison(bot, world, progress);
	const ledge = trueLedgePrison(bot, lip, loop, progress);
	const idle = nearEnemyIdle(bot, world, progress);
	if (ledge) return reason('ledge', 100, lip);
	if (wall) return reason('wall', 92, null);
	if ((stateLoop || dirLoop) && idle) return reason('oscillation', 82, null);
	if (idle) return reason('stall', 64, null);
	return reason('none', 0, null);
}

function reason(kind, score, lip) {
	return { kind, score, stuck: score > 0, lip };
}

function trueLedgePrison(bot, lip, loop, progress) {
	if (!lip) return false;
	if (loop?.edgeBounceFrames > 72) return true;
	if (progress.noProgress > 96 && Math.abs(bot.vx || 0) < 0.55) return true;
	return false;
}

function trueWallPrison(bot, world, progress) {
	if (!world.wall?.blocked) return false;
	const escapeDistance = Math.abs((world.wall.escapeX ?? bot.x) - bot.x);
	const movingTowardEscape =
		Math.sign(world.wall.escapeX - bot.x || 0) === Math.sign(bot.vx || 0);
	if (escapeDistance < 70) return false;
	if (movingTowardEscape && Math.abs(bot.vx || 0) > 0.8) return false;
	return progress.noProgress > 120 || progress.repeatedDecision > 120;
}

function nearEnemyIdle(bot, world, progress) {
	const nearEnemy =
		Math.abs(world.target.x - bot.x) < 230 && Math.abs(world.target.y - bot.y) < 180;
	const attacking = !!(
		bot.attack ||
		bot.rapidAttack ||
		bot.input?.punch ||
		bot.input?.kick ||
		bot.input?.grab ||
		bot.input?.rapidPunch
	);
	return nearEnemy && !attacking && Math.abs(bot.vx || 0) < 0.28 && progress.noProgress > 72;
}

function hasStateLoop(samples) {
	if (samples.length < 8) return false;
	const a = samples.at(-1)?.state;
	const b = samples.at(-2)?.state;
	return (
		a &&
		b &&
		a !== b &&
		samples.at(-3)?.state === a &&
		samples.at(-4)?.state === b &&
		samples.at(-5)?.state === a
	);
}

function hasDirectionLoop(samples) {
	if (samples.length < 8) return false;
	const signs = samples
		.slice(-8)
		.map(s => Math.sign(s.vx || 0))
		.filter(Boolean);
	if (signs.length < 6) return false;
	return signs.every((s, i) => i === 0 || s !== signs[i - 1]);
}

function nearPlatformLip(bot, platforms) {
	let best = null;
	for (const p of platforms) {
		best = closer(best, lipCandidate(bot, p, -1));
		best = closer(best, lipCandidate(bot, p, 1));
	}
	return best;
}

function lipCandidate(bot, p, side) {
	const edgeX = side < 0 ? p.x : p.x + p.w;
	const dx = Math.abs(bot.x - edgeX);
	const dy = bot.y - p.y;
	if (dx > 105 || dy < -35 || dy > 120) return null;
	return {
		platform: p,
		edgeX,
		side,
		inward: Math.sign(p.x + p.w / 2 - bot.x) || -side,
		score: dx + Math.abs(dy - 20) * 0.25
	};
}

function closer(a, b) {
	if (!b) return a;
	return !a || b.score < a.score ? b : a;
}
