//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the hero pose targets vessel in this instant, revealing
 * its focused js render fighter hero converter service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hero pose target names.
 *
 * Chapter 193: each motion receives a name so the timeline can choose a clear
 * vessel instead of guessing from noisy bones.
 */
export function heroPoseTarget(f) {
	if (f.attack || f.rapidAttack) return isKick(f.attack || f.rapidAttack) ? 'kick' : 'punch';
	if ((f.stun || 0) > 0 || (f.damage || 0) > 140) return 'stun';
	if (!f.grounded) return (f.vy || 0) < 0 ? 'jump' : 'fall';
	if (Math.abs(f.vx || 0) > 0.9) return 'run';
	return 'idle';
}

function isKick(a) {
	return a?.id?.includes('kick') || a?.id === 'roundhouse' || a?.id === 'meteorKick';
}
