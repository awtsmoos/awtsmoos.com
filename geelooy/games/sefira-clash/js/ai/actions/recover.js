//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the recover vessel in this instant, revealing
 * its focused js ai actions service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Recovery action.
 *
 * Chapter 199: recovery is a commandment. The bot drifts toward safe center,
 * jumps when possible, and triggers recovery burst upward instead of waiting
 * beneath the stage like a forgotten spark.
 */
export function recover(bot, goal) {
	const edge = goal.sense.edge;
	const side = Math.sign(edge.center - bot.x) || 1;
	return {
		x: side,
		aimX: side,
		aimY: -1,
		y: -1,
		down: false,
		jump: true,
		punch: true,
		kick: false,
		grab: false,
		shield: false,
		special: true
	};
}

/**
 * Reveals the edge safe behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} goal The goal value entering this behavior.
 */
export function edgeSafe(bot, goal) {
	const edge = goal.sense.edge;
	const side = edge.inward || Math.sign(edge.center - bot.x) || 1;
	return {
		x: side,
		aimX: side,
		aimY: 0,
		y: 0,
		down: false,
		jump: false,
		punch: false,
		kick: false,
		grab: false,
		shield: false,
		special: false
	};
}
