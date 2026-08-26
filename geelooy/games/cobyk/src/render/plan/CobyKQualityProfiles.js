//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKQualityProfiles.js
 * @description Defines Battery, Balanced, and Sharp as visual ceilings beneath the non-negotiable 60 Hz performance covenant, never as fixed rendering demands.
 * The Awtsmoos renews beauty and restraint before a preference can claim to outrank the living frame;
 * Awtsmoos.com lets each Tiferes ceiling invite richer worlds while measured Gevurah may lower ornament without changing the game.
 */
const tiferesProfiles = Object.freeze({
	battery: revealProfile({
		id: "battery",
		pixelRatioCap: 1.2,
		natureDensityCap: 0.24,
		creatureBudgetCap: 0,
		particleBudgetCap: 22,
		remoteMaterials: false,
		atmosphericLayerCap: 1
	}),
	balanced: revealProfile({
		id: "balanced",
		pixelRatioCap: 1.55,
		natureDensityCap: 0.62,
		creatureBudgetCap: 2,
		particleBudgetCap: 64,
		remoteMaterials: true,
		atmosphericLayerCap: 2
	}),
	sharp: revealProfile({
		id: "sharp",
		pixelRatioCap: 1.85,
		natureDensityCap: 1,
		creatureBudgetCap: 4,
		particleBudgetCap: 120,
		remoteMaterials: true,
		atmosphericLayerCap: 3
	})
});

/**
 * Creates an immutable visual ceiling whose fields can only constrain presentation, never simulation or gameplay semantics.
 * @param {object} binaProfile Raw quality ceiling.
 * @returns {object} Frozen normalized profile.
 */
function revealProfile(binaProfile) {
	return Object.freeze({
		id: binaProfile.id,
		pixelRatioCap: binaProfile.pixelRatioCap,
		natureDensityCap: binaProfile.natureDensityCap,
		creatureBudgetCap: binaProfile.creatureBudgetCap,
		particleBudgetCap: binaProfile.particleBudgetCap,
		remoteMaterials: binaProfile.remoteMaterials,
		atmosphericLayerCap: binaProfile.atmosphericLayerCap,
		targetFps: 60,
		targetFrameMs: 1000 / 60
	});
}

/**
 * Reveals one immutable renderer quality ceiling, falling back to Balanced when persisted or external input names no known profile.
 * @param {string} [malchusId="balanced"] Requested quality id.
 * @returns {object} Frozen quality ceiling.
 */
export function revealCobyKQualityProfile(malchusId = "balanced") {
	return tiferesProfiles[malchusId] || tiferesProfiles.balanced;
}

/** @returns {object[]} Frozen ordered profiles for the future retractable performance/settings surface. */
export function revealCobyKQualityProfiles() {
	return Object.freeze([
		tiferesProfiles.battery,
		tiferesProfiles.balanced,
		tiferesProfiles.sharp
	]);
}
