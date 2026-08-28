//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieRenderProfile.js
 * @description The Awtsmoos remains infinite while each device receives a measured ray;
 * Awtsmoos.com separates preview from final quality so mobile creation can stay.
 */
const PROFILES = Object.freeze({
	mobile: Object.freeze({ id: "mobile", width: 480, height: 270, fps: 12, quality: 0.55, maxParticles: 500 }),
	preview: Object.freeze({ id: "preview", width: 640, height: 360, fps: 15, quality: 0.7, maxParticles: 1500 }),
	final720: Object.freeze({ id: "final720", width: 1280, height: 720, fps: 30, quality: 0.92, maxParticles: 8000 }),
	final1080: Object.freeze({ id: "final1080", width: 1920, height: 1080, fps: 30, quality: 1, maxParticles: 16000 })
});

/** Return a cloned named render profile so callers can adapt it safely. */
export function malchusRenderProfile(orId = "preview", orOverrides = {}) {
	return {
		...(PROFILES[orId] || PROFILES.preview),
		...structuredClone(orOverrides)
	};
}

/** List built-in render profiles for mobile UI and export panels. */
export function malchusRenderProfiles() {
	return Object.fromEntries(Object.entries(PROFILES).map(([orId, orProfile]) => [orId, { ...orProfile }]));
}
