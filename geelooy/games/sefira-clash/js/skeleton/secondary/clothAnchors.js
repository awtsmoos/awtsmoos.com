//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the cloth anchors vessel in this instant, revealing
 * its focused js skeleton secondary service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function clothAnchors(p) {
	return {
		back: {
			x: (p.leftShoulder.x + p.rightShoulder.x) / 2,
			y: (p.leftShoulder.y + p.rightShoulder.y) / 2
		},
		leftShoulder: p.leftShoulder,
		rightShoulder: p.rightShoulder,
		leftHip: p.leftHip,
		rightHip: p.rightHip,
		hip: p.hip,
		sleeves: { left: p.leftElbow, right: p.rightElbow }
	};
}
