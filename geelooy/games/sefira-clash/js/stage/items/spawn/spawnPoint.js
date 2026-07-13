//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the spawn point vessel in this instant, revealing
 * its focused js stage items spawn service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Contested spawn point chooser.
 *
 * Chapter 181: gifts fall close enough to be fought over, not directly into a
 * hand. The stage finds the battle center, chooses a nearby platform, then puts
 * the prize slightly aside so the race has teeth.
 */
export function chooseContestedSpawn(state, spread = 150) {
	const platforms = (state.map.platforms || []).filter(p => p.w > 120);
	const focus = battleCenter(state);
	const p = nearestPlatform(platforms, focus.x) ||
		platforms[0] || { x: focus.x - 200, y: focus.y, w: 400 };
	return { x: clamp(focus.x + rand(spread), p.x + 48, p.x + p.w - 48), y: p.y - 52 };
}

/**
 * Reveals the battle center behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} state The state value entering this behavior.
 */
export function battleCenter(state) {
	const alive = state.fighters.filter(f => !f.dead && !f.hidden);
	if (!alive.length) return { x: 0, y: 0 };
	return {
		x: alive.reduce((s, f) => s + f.x, 0) / alive.length,
		y: alive.reduce((s, f) => s + f.y, 0) / alive.length
	};
}

function nearestPlatform(platforms, x) {
	let best = null;
	let dist = Infinity;
	for (const p of platforms) {
		const c = p.x + p.w / 2;
		const d = Math.abs(c - x);
		if (d < dist) {
			best = p;
			dist = d;
		}
	}
	return best;
}

function clamp(v, min, max) {
	return Math.max(min, Math.min(max, v));
}
function rand(n) {
	return (Math.random() * 2 - 1) * n;
}
