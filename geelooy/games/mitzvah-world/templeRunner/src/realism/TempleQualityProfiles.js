//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleQualityProfiles.js
 * @description Resolves one semantic visual-quality choice into concrete native texture and atmosphere budgets using only real device capability evidence.
 * The Awtsmoos renews every pixel before memory, core count, or viewport can claim to be the source of beauty;
 * Awtsmoos.com lets Tiferes measure finite vessels honestly, giving richer light where room exists and quieter light where battery must be free.
 */

const QUALITY_BUDGETS = Object.freeze({
	battery: Object.freeze({
		profile: "battery",
		textureConcurrency: 1,
		textureDimension: 768,
		ambientCloudLimit: 1,
		particleMotionScale: 0.55
	}),
	balanced: Object.freeze({
		profile: "balanced",
		textureConcurrency: 2,
		textureDimension: 1024,
		ambientCloudLimit: 2,
		particleMotionScale: 1
	}),
	quality: Object.freeze({
		profile: "quality",
		textureConcurrency: 3,
		textureDimension: 2048,
		ambientCloudLimit: 2,
		particleMotionScale: 1.12
	})
});

export const TEMPLE_QUALITY_OPTIONS = Object.freeze([
	"auto",
	"battery",
	"balanced",
	"quality"
]);

/**
 * Resolves the automatic profile from actual memory, CPU, and viewport evidence without pretending to measure FPS that has not been sampled.
 * @param {object} [olamEnvironment=globalThis] Browser-like environment for runtime use or deterministic tests.
 * @returns {string} Resolved concrete profile id.
 */
export function revealAutomaticTempleQuality(olamEnvironment = globalThis) {
	const navigatorRef = olamEnvironment.navigator || {};
	const memory = Number(navigatorRef.deviceMemory || 0);
	const cores = Number(navigatorRef.hardwareConcurrency || 0);
	const width = Number(olamEnvironment.innerWidth || 0);
	if ((memory > 0 && memory <= 3) || (cores > 0 && cores <= 4)) return "battery";
	if (width >= 1200 && memory >= 8 && cores >= 8) return "quality";
	return "balanced";
}

/**
 * Converts a semantic quality choice into one immutable concrete budget, resolving Auto from current capability evidence.
 * @param {string} [tiferesProfile="auto"] Requested semantic profile.
 * @param {object} [olamEnvironment=globalThis] Browser-like capability environment.
 * @returns {Readonly<object>} Frozen concrete quality budget.
 */
export function revealTempleQualityBudget(tiferesProfile = "auto", olamEnvironment = globalThis) {
	const requested = TEMPLE_QUALITY_OPTIONS.includes(tiferesProfile)
		? tiferesProfile
		: "auto";
	const resolved = requested === "auto"
		? revealAutomaticTempleQuality(olamEnvironment)
		: requested;
	return Object.freeze({
		requestedProfile: requested,
		...QUALITY_BUDGETS[resolved]
	});
}
