//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the memory vessel in this instant, revealing
 * its focused js ai direct service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — tiny memory against pacing and blank minds. */
export function remember(bot, target, close) {
	bot.aiMind ||= {};
	const m = bot.aiMind;
	m.clock = (m.clock || 0) + 1;
	m.targetId = target.id;
	m.lastTargetX = target.x;
	m.lastTargetY = target.y;
	m.noPressure = close || bot.attack || bot.rapidAttack ? 0 : (m.noPressure || 0) + 1;
	const lane = Math.round((bot.x || 0) / 90) + ':' + Math.round((bot.y || 0) / 90);
	m.sameLane = m.lastLane === lane ? (m.sameLane || 0) + 1 : 0;
	m.lastLane = lane;
	m.combatHeat ||= { heat: 32, noDamageFrames: 0, forceEngage: false, killMode: false };
	m.combatHeat.noDamageFrames = m.noPressure;
	m.combatHeat.forceEngage = m.noPressure > 120;
	m.combatHeat.heat = Math.min(100, 32 + m.noPressure * 0.25);
	m.positionLoop ||= { loopDetected: false, idleNearEnemyFrames: 0, edgeBounceFrames: 0 };
	m.positionLoop.idleNearEnemyFrames =
		close && Math.abs(bot.vx || 0) < 0.2 && !bot.attack
			? (m.positionLoop.idleNearEnemyFrames || 0) + 1
			: 0;
	return m;
}
