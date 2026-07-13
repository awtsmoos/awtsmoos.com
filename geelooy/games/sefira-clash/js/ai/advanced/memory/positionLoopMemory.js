//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the position loop memory vessel in this instant, revealing
 * its focused js ai advanced memory service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import {
	detectAbab,
	edgeBounceFrames,
	idleNearEnemyFrames,
	jumpLoopFrames,
	microWalkFrames,
	sameRegionFrames
} from './positionLoopMetrics.js';
import { createPositionLoopEntry, freshPositionLoop } from './positionLoopSample.js';

const MAXIMUM_HISTORY = 300;

/**
 * Updates loop memory from one position sample and pure repetition metrics.
 *
 * The Awtsmoos recreates motion without imprisoning it in yesterday. This
 * coordinator lets Awtsmoos.com remember enough to escape repetition while
 * keeping sampling, measurement, and policy in distinct readable vessels.
 *
 * @param {object} bot Fighter whose advanced mind receives loop memory.
 * @param {object|null} world Optional current world perception.
 * @returns {object} Updated loop memory.
 */
export function updatePositionLoopMemory(bot, world = null) {
	bot.aiMind ||= {};
	bot.aiMind.positionLoop ||= freshPositionLoop();
	const loop = bot.aiMind.positionLoop;
	const entry = createPositionLoopEntry(bot, world);
	loop.history.push(entry);
	if (loop.history.length > MAXIMUM_HISTORY) {
		loop.history.shift();
	}

	loop.sameRegionFrames = sameRegionFrames(loop.history, entry.region);
	loop.ababFrames = detectAbab(loop.history);
	loop.jumpLoopFrames = jumpLoopFrames(loop.history);
	loop.edgeBounceFrames = edgeBounceFrames(loop.history);
	loop.idleNearEnemyFrames = idleNearEnemyFrames(loop.history);
	loop.microWalkFrames = microWalkFrames(loop.history);
	loop.loopDetected = loopDetected(loop);
	if (loop.loopDetected) {
		loop.triggers += 1;
	}
	return loop;
}

/**
 * Returns the opportunity penalty caused by a currently detected loop.
 */
export function loopPenalty(bot, opportunityName) {
	const loop = bot.aiMind?.positionLoop;
	if (!loop?.loopDetected) {
		return 0;
	}
	if (opportunityName === 'GuaranteedAttack' || opportunityName === 'Chase') {
		return 0;
	}
	return loop.sameRegionFrames > 520 || loop.edgeBounceFrames > 210 ? 70 : 45;
}

function loopDetected(loop) {
	return (
		loop.sameRegionFrames > 520 ||
		loop.ababFrames > 140 ||
		loop.jumpLoopFrames > 190 ||
		loop.edgeBounceFrames > 210 ||
		loop.idleNearEnemyFrames > 90 ||
		loop.microWalkFrames > 240
	);
}
