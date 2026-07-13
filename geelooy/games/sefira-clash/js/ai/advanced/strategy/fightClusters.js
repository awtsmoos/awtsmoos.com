//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the fight clusters vessel in this instant, revealing
 * its focused js ai advanced strategy service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Fight clusters.
 *
 * Chapter 78: the arena is no longer a set of lonely targets. It is weather:
 * hot brawls, cold exile, and centers of violence calling wanderers home.
 */
export function buildFightClusters(state) {
	const fighters = state.fighters.filter(f => !f.dead && !f.hidden);
	const clusters = [];
	for (const f of fighters) addToCluster(clusters, f);
	for (const c of clusters) finishCluster(c, state);
	return clusters.sort((a, b) => b.heat - a.heat || b.members.length - a.members.length);
}

/**
 * Reveals the nearest cluster behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} bot The bot value entering this behavior.
 * @param {*} clusters The clusters value entering this behavior.
 */
export function nearestCluster(bot, clusters) {
	return [...clusters].sort((a, b) => dist(bot, a) - dist(bot, b))[0] || null;
}

/**
 * Reveals the hottest cluster behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} clusters The clusters value entering this behavior.
 */
export function hottestCluster(clusters) {
	return clusters[0] || null;
}

function addToCluster(clusters, fighter) {
	const c = clusters.find(cluster => dist(fighter, cluster) < 760);
	if (c) c.members.push(fighter);
	else clusters.push({ members: [fighter], x: fighter.x, y: fighter.y, heat: 0 });
}

function finishCluster(c, state) {
	c.x = avg(c.members, 'x');
	c.y = avg(c.members, 'y');
	c.damage = c.members.reduce((s, f) => s + (f.damage || 0), 0);
	c.humans = c.members.filter(f => f.human).length;
	c.heat = c.members.length * 28 + c.damage * 0.08 + nearbyEvents(state, c) * 18;
	c.id = `${Math.round(c.x)}:${Math.round(c.y)}:${c.members.length}`;
}

function nearbyEvents(state, c) {
	return (state.events || []).filter(e => Math.hypot((e.x || 0) - c.x, (e.y || 0) - c.y) < 680)
		.length;
}
function avg(list, key) {
	return list.reduce((s, f) => s + f[key], 0) / Math.max(1, list.length);
}
function dist(f, c) {
	return Math.hypot(f.x - c.x, (f.y - c.y) * 0.5);
}
