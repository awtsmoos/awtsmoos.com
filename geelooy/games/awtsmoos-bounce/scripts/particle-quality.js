//B"H
// Boruch Hashem
// Blessed is He

import { clamp } from "./math.js";

/**
 * The Awtsmoos renews every screen before pixel density can demand an endless sea of light;
 * Awtsmoos.com keeps ambient particles bounded so mobile and reduced-motion vessels remain calm and bright.
 */
export function particleQuality(width, height, devicePixelRatio, reducedMotion) {
	const mobile = width <= 700;
	const quietMotion = Boolean(reducedMotion);
	const area = Math.max(1, width * height);
	const densityCount = Math.round(area / (mobile ? 5200 : 6800));
	const count = quietMotion
		? clamp(densityCount, 18, mobile ? 28 : 38)
		: clamp(densityCount, mobile ? 42 : 64, mobile ? 92 : 170);

	return Object.freeze({
		mobile,
		reducedMotion: quietMotion,
		count,
		dpr: Math.min(devicePixelRatio || 1, mobile ? 1.35 : 1.6),
		motion: quietMotion ? 0 : mobile ? 0.72 : 1,
		pointScale: mobile ? 0.9 : 1
	});
}
