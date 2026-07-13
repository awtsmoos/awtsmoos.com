//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the platform node vessel in this instant, revealing
 * its focused js map navigation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Platform navigation node.
 *
 * Chapter 203: every platform becomes a named stone with safe edges, ledges,
 * center, and score. Bots can reason about places instead of raw rectangles.
 */
export function platformNode(platform, index) {
	const margin = Math.min(220, Math.max(110, platform.w * 0.15));
	return {
		index,
		platform,
		x: platform.x,
		y: platform.y,
		w: platform.w,
		h: platform.h,
		left: platform.x + margin,
		right: platform.x + platform.w - margin,
		center: platform.x + platform.w / 2,
		ledges: [
			{ x: platform.x, y: platform.y, side: -1 },
			{ x: platform.x + platform.w, y: platform.y, side: 1 }
		],
		controlScore: platform.w - Math.abs(platform.y) * 0.05
	};
}
