//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the intent state vessel in this instant, revealing
 * its focused js skeleton intent service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function intentState(f, intent, metrics) {
	return {
		attack: f.attack ? 1 : 0,
		retreat: intent.panic > 0.5 && metrics.movingDirection !== metrics.facing ? 1 : 0,
		panic: intent.panic || 0,
		hunt: intent.hunt || 0,
		commit: f.attack
			? Math.min(1, (f.attackFrame || 0) / Math.max(1, f.attack.startup || 1))
			: 0
	};
}
