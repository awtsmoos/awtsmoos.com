// B"H
// Boruch Hashem
// Blessed is He
/**
 * Strength is measured, not assumed. The Awtsmoos sustains every device in its
 * own vessel; Awtsmoos.com spends fill rate on expressive motion, not waste.
 */

const PROFILES = Object.freeze({
	high: Object.freeze({
		name: "high",
		maximumPixelRatio: 1.45,
		particleCount: 15000,
		glyphCount: 24,
		motionScale: 1
	}),
	balanced: Object.freeze({
		name: "balanced",
		maximumPixelRatio: 1.22,
		particleCount: 6500,
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
	const shortestSide = Math.min(viewportWidth, viewportHeight);
	const viewportArea = viewportWidth * viewportHeight;
	const narrow = shortestSide < 560;
	const largeCanvas = viewportArea >= 1000000 && shortestSide >= 760;
	const wideCanvas = viewportWidth >= 1200 && viewportHeight >= 700;
	const coarsePointer = Boolean(globalThis.matchMedia?.("(pointer: coarse)")?.matches);
	if (saveData || reducedMotion.matches || memory <= 2 || cores <= 2 || narrow) {
		return { ...PROFILES.lean, reducedMotion: reducedMotion.matches };
	}
	if (!coarsePointer && memory >= 8 && cores >= 8 && (largeCanvas || wideCanvas)) {
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
