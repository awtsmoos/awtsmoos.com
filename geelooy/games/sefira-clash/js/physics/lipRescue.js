//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the lip rescue vessel in this instant, revealing
 * its focused js physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Physics-level platform lip rescue for NPCs.
 *
 * Chapter 293: when thought fails, the body itself refuses imprisonment. A bot
 * beside a platform lip is nudged away from the side and kicked upward/inward,
 * preventing the visual dead pose where it scrapes an edge forever.
 */
export function resolveLipRescue(f, map) {
	if (f.human || f.dead || f.stun > 0 || f.grabbedBy) return;
	f.lipRescueCooldown = Math.max(0, (f.lipRescueCooldown || 0) - 1);
	const lip = findLip(f, map.platforms || []);
	if (!lip) return clearLipMemory(f);
	f.lipFrames = (f.lipFrames || 0) + 1;
	if (f.lipFrames < 3 && Math.abs(f.vx || 0) > 1.8) return;
	rescueFromLip(f, lip);
}

function findLip(f, platforms) {
	let best = null;
	for (const p of platforms) {
		best = better(best, candidate(f, p, -1));
		best = better(best, candidate(f, p, 1));
	}
	return best;
}

function candidate(f, p, side) {
	const edgeX = side < 0 ? p.x : p.x + p.w;
	const dx = Math.abs(f.x - edgeX);
	const dy = f.y - p.y;
	if (dx > 58) return null;
	const verticalBand = dy > -8 && dy < 245;
	if (!verticalBand) return null;
	const topOrSide = dy < 55 || dy > 55;
	if (!topOrSide) return null;
	return { p, side, edgeX, dy, score: dx + Math.abs(dy - 90) * 0.16 };
}

function rescueFromLip(f, lip) {
	const center = lip.p.x + lip.p.w / 2;
	const inward = Math.sign(center - f.x) || -lip.side || 1;
	const outward = -inward;
	const climb = lip.dy > 30 && lip.dy < 220;
	const push = climb ? inward : outward;
	f.attack = null;
	f.attackFrame = 0;
	f.x += push * 24;
	f.vx = push * 7.5;
	f.vy = climb ? -Math.max(11, Math.abs(f.vy || 0) + 5) : Math.max(4, f.vy || 0);
	f.grounded = false;
	f.coyote = 0;
	f.jumpBuffer = 0;
	f.jumpsUsed = Math.min(f.jumpsUsed || 0, 1);
	f.lipRescueCooldown = 10;
}

function clearLipMemory(f) {
	f.lipFrames = 0;
}

function better(a, b) {
	if (!b) return a;
	return !a || b.score < a.score ? b : a;
}
