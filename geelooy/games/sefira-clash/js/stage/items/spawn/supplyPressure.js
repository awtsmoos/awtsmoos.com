//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the supply pressure vessel in this instant, revealing
 * its focused js stage items spawn service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Supply pressure.
 *
 * Chapter 178: the arena measures whether the fight needs a comeback spark,
 * more violence, or a chase tool. Supply drops become authored by the battle,
 * not dice alone.
 */
export function supplyPressure(state) {
	const alive = state.fighters.filter(f => !f.dead && !f.hidden);
	const damages = alive.map(f => f.damage || 0);
	const maxDamage = Math.max(0, ...damages);
	const minDamage = Math.min(0, ...damages);
	const spread = maxDamage - minDamage;
	const mood = state.stageMood || {};
	const noPickup = state.frame - (state.stageDirector?.lastPickupFrame || 0);
	if (spread > 105) return { need: 'comeback', urgency: 0.9 };
	if ((mood.quietFrames || 0) > 720) return { need: 'violence', urgency: 0.75 };
	if (noPickup > 1600) return { need: 'chase', urgency: 0.55 };
	return { need: 'normal', urgency: 0.2 };
}
