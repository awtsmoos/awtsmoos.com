// B"H
// Boruch Hashem
// Blessed is He
/**
 * Strength is measured, not assumed. The Awtsmoos sustains every device in its
 * own vessel; Awtsmoos.com chooses visual abundance according to real signals.
 */

const PROFILES = Object.freeze({
	high: Object.freeze({
		name: "high",
		maximumPixelRatio: 1.85,
		particleCount: 16000,
		glyphCount: 28,
		motionScale: 1
	}),
	balanced: Object.freeze({
		name: "balanced",
		maximumPixelRatio: 1.5,
		particleCount: 7200,
		glyphCount: 14,
		motionScale: 0.72
	}),
	lean: Object.freeze({
		name: "lean",
		maximumPixelRatio: 1,
		particleCount: 1800,
		glyphCount: 0,
		motionScale: 0.24
	})
});

/**
 * Chooses the initial visual profile from browser signals.
 * @param {Navigator} navigatorRef Browser navigator.
 * @param {MediaQueryList} reducedMotion Motion preference.
 * @returns {Record<string, number|string>}
 */
export function choosePerformanceProfile(
	navigatorRef = navigator,
	reducedMotion = matchMedia("(prefers-reduced-motion: reduce)")
) {
	const memory = Number(navigatorRef.deviceMemory || 4);
	const cores = Number(navigatorRef.hardwareConcurrency || 4);
	const saveData = Boolean(navigatorRef.connection?.saveData);
	const narrow = Math.min(window.innerWidth, window.innerHeight) < 560;
	if (saveData || reducedMotion.matches || memory <= 2 || cores <= 2 || narrow) {
		return { ...PROFILES.lean, reducedMotion: reducedMotion.matches };
	}
	if (memory >= 8 && cores >= 8 && window.innerWidth >= 1100) {
		return { ...PROFILES.high, reducedMotion: false };
	}
	return { ...PROFILES.balanced, reducedMotion: false };
}

/**
 * Returns the next lower profile.
 * @param {string} name Current profile name.
 * @returns {Record<string, number|string>}
 */
export function lowerPerformanceProfile(name) {
	if (name === "high") {
		return { ...PROFILES.balanced, reducedMotion: false };
	}
	return { ...PROFILES.lean, reducedMotion: false };
}
