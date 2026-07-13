//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the edge safety vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Edge safety sensor.
 *
 * Chapter 109: the bot receives fear of the abyss. A fighter may threaten the
 * edge, edge-guard the edge, or recover from the edge — but it should not
 * absentmindedly walk into nothing like a body without a soul.
 */
export function edgeSafety(bot, floor) {
	const margin = 135;
	const leftDanger = bot.x < floor.x + margin;
	const rightDanger = bot.x > floor.x + floor.w - margin;
	const off = bot.x < floor.x - 20 || bot.x > floor.x + floor.w + 20 || bot.y > floor.y + 170;
	const inward = leftDanger ? 1 : rightDanger ? -1 : 0;
	const center = floor.x + floor.w / 2;
	return {
		leftDanger,
		rightDanger,
		danger: leftDanger || rightDanger,
		off,
		inward,
		center,
		left: floor.x + margin,
		right: floor.x + floor.w - margin
	};
}

/**
 * Clamps a goal so ordinary bot intentions stay on real stone.
 * @param {number} goalX Desired x coordinate.
 * @param {object} safety Edge safety result.
 * @returns {number} Safe x goal.
 */
export function clampGoalToFloor(goalX, safety) {
	return Math.max(safety.left, Math.min(safety.right, goalX));
}
