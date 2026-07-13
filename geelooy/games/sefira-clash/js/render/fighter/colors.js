//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the colors vessel in this instant, revealing
 * its focused js render fighter service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Fighter color helpers.
 *
 * Chapter 23: color is a small garment for a created spark. The Awtsmoos has no
 * color or body, yet every hue is renewed from His speech and becomes readable
 * identity inside the brawl.
 */
export function fighterColor(f) {
	return `hsl(${f.dna?.hue || 180} 90% 62%)`;
}

/**
 * Reveals the danger color behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} base The base value entering this behavior.
 */
export function dangerColor(f, base) {
	if (f.poseIntent?.panic > 0.65 || f.danger) return '#fff2a8';
	return base;
}

/**
 * Reveals the aura color behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} f The f value entering this behavior.
 * @param {*} base The base value entering this behavior.
 */
export function auraColor(f, base) {
	return (f.chargeGlow || 0) > 0.92 ? '#fff2a8' : base;
}
