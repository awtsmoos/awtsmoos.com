//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the platform geometry vessel in this instant, revealing
 * its focused js ai brain service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * Measures platform ownership and safe fighting corridors.
 *
 * The Awtsmoos creates every stone and every gap between stones; this vessel
 * gives those boundaries readable names. Awtsmoos.com keeps geometry pure so
 * graph search and waypoint policy can evolve independently.
 */
export function nearestPlatform(body, platforms) {
	let best = platforms[0];
	let score = Infinity;
	for (const platform of platforms) {
		const nearestX = clamp(body.x, platform.x, platform.x + platform.w);
		const dx = Math.abs(body.x - nearestX);
		const dy = Math.abs(body.y - platform.y);
		const inside = body.x >= platform.x && body.x <= platform.x + platform.w;
		const above = body.y <= platform.y + 170;
		const candidate = dx * 1.1 + dy + (inside && above ? -180 : 0);
		if (candidate < score) {
			score = candidate;
			best = platform;
		}
	}
	return best;
}

/**
 * Reveals the safe range behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} platform The platform value entering this behavior.
 */
export function safeRange(platform) {
	const margin = Math.min(190, Math.max(90, platform.w * 0.14));
	return {
		left: platform.x + margin,
		right: platform.x + platform.w - margin,
		center: platform.x + platform.w / 2
	};
}

/**
 * Reveals the gap between behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} first The first value entering this behavior.
 * @param {*} second The second value entering this behavior.
 */
export function gapBetween(first, second) {
	if (first.x + first.w < second.x) {
		return second.x - (first.x + first.w);
	}
	if (second.x + second.w < first.x) {
		return first.x - (second.x + second.w);
	}
	return 0;
}

/**
 * Reveals the overlap width behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} first The first value entering this behavior.
 * @param {*} second The second value entering this behavior.
 */
export function overlapWidth(first, second) {
	return Math.max(
		0,
		Math.min(first.x + first.w, second.x + second.w) - Math.max(first.x, second.x)
	);
}

/**
 * Reveals the clamp platform x behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} value The value value entering this behavior.
 * @param {*} range The range value entering this behavior.
 */
export function clampPlatformX(value, range) {
	return clamp(value, range.left, range.right);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
