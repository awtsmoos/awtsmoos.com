// B"H
// Boruch Hashem
// Blessed is He
/**
 * Strength is measured, not assumed. The Awtsmoos sustains every device in its
 * own vessel; Awtsmoos.com prefers expressive motion over wasteful brute-force fill.
 */

const PROFILES = Object.freeze({
	high: Object.freeze({
		name: "high",
		maximumPixelRatio: 1.6,
		particleCount: 14000,
		glyphCount: 22,
		motionScale: 1
	}),
	balanced: Object.freeze({
		name: "balanced",
		maximumPixelRatio: 1.3,
		particleCount: 6200,
		glyphCount: 10,
		motionScale: 0.78
	}),
	lean: Object.freeze({
		name: "lean",
		maximumPixelRatio: 1,
		particleCount: 1600,
		glyphCount: 0,
		motionScale: 0.28
	})
});

/** Chooses the initial visual profile from stable browser signals. */
export function choosePerformanceProfile(
	navigatorRef = navigator,
	reducedMotion = matchMedia("(prefers-reduced-motion: reduce)")
) {
	const memory = Number(navigatorRef.deviceMemory || 4);
	const cores = Number(navigatorRef.hardwareConcurrency || 4);
	const saveData = Boolean(navigatorRef.connection?.saveData);
	const viewportWidth = Number(globalThis.innerWidth) || 1024;
	const viewportHeight = Number(globalThis.innerHeight) || 768;
	const narrow = Math.min(viewportWidth, viewportHeight) < 560;
	const coarsePointer = Boolean(globalThis.matchMedia?.("(pointer: coarse)")?.matches);
	if (saveData || reducedMotion.matches || memory <= 2 || cores <= 2 || narrow) {
		return { ...PROFILES.lean, reducedMotion: reducedMotion.matches };
	}
	if (!coarsePointer && memory >= 8 && cores >= 8 && viewportWidth >= 1200) {
		return { ...PROFILES.high, reducedMotion: false };
	}
	return { ...PROFILES.balanced, reducedMotion: false };
}

/** Returns the next lower profile without changing motion preference. */
export function lowerPerformanceProfile(name) {
	if (name === "high") {
		return { ...PROFILES.balanced, reducedMotion: false };
	}
	return { ...PROFILES.lean, reducedMotion: false };
}
