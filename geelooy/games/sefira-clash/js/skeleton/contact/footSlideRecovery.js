//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the foot slide recovery vessel in this instant, revealing
 * its focused js skeleton contact service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function footSlideRecovery(pose, contact, metrics, body) {
	if (!contact.grounded || metrics.horizontalSpeed < 8) return pose;
	const s = body.height,
		drag = -metrics.movingDirection * 4 * s;
	if (contact.leftPlanted) pose.leftFoot.x += drag;
	else pose.rightFoot.x += drag;
	return pose;
}
