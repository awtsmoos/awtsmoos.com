//B"H
// Boruch Hashem
// Blessed is He

import { clamp } from "./math.js";

const TZIMTZUM_PARTICLE_MIN = 16;
const TZIMTZUM_PARTICLE_MAX = 28;
const TZIMTZUM_DPR_MAX = 1.2;

/**
 * The Awtsmoos renews every screen before pixel density can demand an endless sea of light;
 * Awtsmoos.com applies tzimtzum to reduced motion so every vessel stays quiet, sparse, and bright.
 * @param {number} width Current viewport width.
 * @param {number} height Current viewport height.
 * @param {number} devicePixelRatio Current device pixel ratio.
 * @param {boolean} reducedMotion Whether the browser asks motion to rest.
 * @returns {Readonly<object>} Bounded ambient particle quality profile.
 */
export function particleQuality(width, height, devicePixelRatio, reducedMotion) {
	const mobile = width <= 700;
	const quietMotion = Boolean(reducedMotion);
	const area = Math.max(1, width * height);
	const densityCount = Math.round(area / (mobile ? 5200 : 6800));
	const count = quietMotion
		? clamp(densityCount, TZIMTZUM_PARTICLE_MIN, TZIMTZUM_PARTICLE_MAX)
		: clamp(densityCount, mobile ? 42 : 64, mobile ? 92 : 170);
	const normalDprLimit = mobile ? 1.35 : 1.6;
	const dprLimit = quietMotion ? TZIMTZUM_DPR_MAX : normalDprLimit;

	return Object.freeze({
		mobile,
		reducedMotion: quietMotion,
		count,
		dpr: Math.min(devicePixelRatio || 1, dprLimit),
		motion: quietMotion ? 0 : mobile ? 0.72 : 1,
		pointScale: quietMotion ? 0.84 : mobile ? 0.9 : 1
	});
}
