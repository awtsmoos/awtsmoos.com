//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the magnetic pull vessel in this instant, revealing
 * its focused js powerups effects service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Stage-born pickup pull.
 *
 * Chapter 75: even without a magnet buff, fresh stage relics breathe toward the
 * nearest fighter. They should be contested and claimed, not ignored scenery.
 */
export function applyMagneticPull(state) {
	const fighters = state.fighters.filter(f => !f.dead && !f.hidden);
	const magnets = fighters.filter(f => f.buffs?.magneticOrb);
	for (const orb of state.powerups || []) {
		if (!orb.active || !orb.stageBorn) continue;
		const holder = nearest(magnets.length ? magnets : fighters, orb);
		if (!holder) continue;
		const dx = holder.x - orb.x,
			dy = holder.y - 88 - orb.y,
			d = Math.max(1, Math.hypot(dx, dy));
		const range = magnets.length ? 480 : 260;
		if (d > range) continue;
		const speed = magnets.length ? 2.4 : 0.9;
		orb.x += (dx / d) * speed;
		orb.y += (dy / d) * speed * 0.65;
	}
}

function nearest(fighters, orb) {
	let best = null,
		dist = Infinity;
	for (const f of fighters) {
		const d = Math.hypot(f.x - orb.x, f.y - 88 - orb.y);
		if (d < dist) {
			best = f;
			dist = d;
		}
	}
	return best;
}
