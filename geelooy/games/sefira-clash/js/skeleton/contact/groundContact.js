//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the ground contact vessel in this instant, revealing
 * its focused js skeleton contact service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function groundContact(f, metrics) {
	return {
		groundY: f.y + 2,
		grounded: metrics.grounded,
		leftPlanted: metrics.footPhase < 0.5,
		rightPlanted: metrics.footPhase >= 0.5,
		contactPower: metrics.grounded ? Math.min(1, metrics.horizontalSpeed / 9) : 0
	};
}
