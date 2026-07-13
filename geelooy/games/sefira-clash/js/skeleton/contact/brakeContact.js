//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the brake contact vessel in this instant, revealing
 * its focused js skeleton contact service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function brakeContact(pose, contact, metrics, body) {
	if (!contact.grounded || !metrics.turnMismatch) return pose;
	const s = body.height,
		face = metrics.facing;
	pose.chest.x -= face * 10 * s;
	pose.leftFoot.x -= face * 8 * s;
	pose.rightFoot.x -= face * 12 * s;
	return pose;
}
