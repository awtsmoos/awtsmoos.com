//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the recovery planner vessel in this instant, revealing
 * its focused js ai planning service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Recovery planner.
 *
 * Chapter 230: not every edge is danger. When the target is below and the route
 * says drop, the edge is a staircase. Recovery must not override descent unless
 * the bot is actually offstage or falling beneath safety.
 */
export function planRecovery(bot, sense) {
	const edge = sense.edge;
	const route = sense.route;
	const plannedDescent = route?.needsDrop && !bot.grabbedBy;
	if (
		bot.y > route.current.y + 180 ||
		bot.x < route.current.x - 140 ||
		bot.x > route.current.x + route.current.w + 140
	) {
		return { kind: 'recover', score: 1000 };
	}
	if (edge.danger && !plannedDescent) return { kind: 'edgeSafe', score: 960 };
	return { kind: 'none', score: 0 };
}
