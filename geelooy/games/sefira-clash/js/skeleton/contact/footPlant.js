//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the foot plant vessel in this instant, revealing
 * its focused js skeleton contact service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function footPlant(pose, contact, body) {
	if (!contact.grounded) return pose;
	const s = body.height;
	if (contact.leftPlanted) {
		pose.leftFoot.y = contact.groundY;
		pose.leftFoot.x -= 3 * s;
	} else {
		pose.rightFoot.y = contact.groundY;
		pose.rightFoot.x += 3 * s;
	}
	return pose;
}
