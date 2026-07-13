//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the heel toe roll vessel in this instant, revealing
 * its focused js skeleton contact service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
export function heelToeRoll(pose, contact, metrics, body) {
	if (!contact.grounded) return pose;
	const s = body.height,
		roll =
			Math.sin(metrics.footPhase * Math.PI * 2) * Math.min(1, metrics.horizontalSpeed / 10);
	pose.leftFoot.y += Math.max(0, roll) * 2 * s;
	pose.rightFoot.y += Math.max(0, -roll) * 2 * s;
	return pose;
}
