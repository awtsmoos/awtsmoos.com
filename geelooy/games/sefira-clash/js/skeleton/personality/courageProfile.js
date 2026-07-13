//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the courage profile vessel in this instant, revealing
 * its focused js skeleton personality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function courageProfile(profile, f) {
	const damage = (f.damage || 0) / 220;
	return {
		courage: Math.max(
			0,
			1 - damage - (profile.coward ? 0.25 : 0) + (profile.veteran ? 0.18 : 0)
		),
		hesitation: Math.max(
			0,
			damage * 0.5 + (profile.coward ? 0.25 : 0) - (profile.hunter ? 0.15 : 0)
		)
	};
}
