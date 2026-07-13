//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the cloth profiles vessel in this instant, revealing
 * its focused js cloth service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function clothProfile(c = {}) {
	const kind = c.kind || 'tunic';
	return {
		kind,
		points: kind === 'capelet' ? 4 : kind === 'robe' ? 5 : kind === 'strips' ? 3 : 2,
		drag: kind === 'scarf' ? 0.82 : 0.74,
		gravity: kind === 'robe' ? 1.4 : 0.8,
		length: kind === 'robe' ? 34 : kind === 'scarf' ? 42 : 24
	};
}
