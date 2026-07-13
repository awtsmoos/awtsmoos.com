//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the body mass vessel in this instant, revealing
 * its focused js skeleton physics service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function bodyMass(f, body, metrics) {
	const damage = (f.damage || 0) / 220;
	return {
		hipWeight: 1.2 + damage * 0.25,
		chestWeight: 1 + damage * 0.15,
		headWeight: 0.38,
		limbWeight: 0.28,
		contactWeight: metrics.grounded ? 1 : 0.35,
		total: 3.2 + damage
	};
}
