//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the position loop sample vessel in this instant, revealing
 * its focused js ai advanced memory service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Samples one positional memory frame and creates fresh loop state.
 *
 * The Awtsmoos renews the fighter at every coordinate, yet memory lets the mind
 * recognize when renewal has become repetition. Awtsmoos.com keeps sampling in
 * this vessel so metric policy remains independent from world observation.
 */
export function createPositionLoopEntry(bot, world = null) {
	const nearEnemy = world
		? Math.abs(world.target.x - bot.x) < 210 && Math.abs(world.target.y - bot.y) < 175
		: false;
	const attacking = Boolean(
		bot.attack ||
		bot.rapidAttack ||
		bot.input?.punch ||
		bot.input?.kick ||
		bot.input?.grab ||
		bot.input?.rapidPunch
	);
	return {
		region: regionKey(bot.x, bot.y),
		x: bot.x,
		y: bot.y,
		jump: Boolean(bot.input?.jump),
		nearEnemy,
		attacking,
		edgeNear: nearEdge(bot, world),
		vx: bot.vx || 0,
		inputX: bot.input?.x || 0
	};
}

/**
 * Returns the complete initial state expected by loop metrics and penalties.
 */
export function freshPositionLoop() {
	return {
		history: [],
		sameRegionFrames: 0,
		ababFrames: 0,
		jumpLoopFrames: 0,
		edgeBounceFrames: 0,
		idleNearEnemyFrames: 0,
		microWalkFrames: 0,
		loopDetected: false,
		triggers: 0
	};
}

function nearEdge(bot, world) {
	const platform = world?.current?.p || bot.currentPlatform;
	if (!platform) {
		return false;
	}
	return Math.min(Math.abs(bot.x - platform.x), Math.abs(bot.x - (platform.x + platform.w))) < 92;
}

function regionKey(x, y) {
	return `${Math.floor(x / 250)}:${Math.floor(y / 250)}`;
}
