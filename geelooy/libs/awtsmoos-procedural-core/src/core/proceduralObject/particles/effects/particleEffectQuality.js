// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file particleEffectQuality.js
 * @description Centralizes effect density and capacity budgets so one recipe scales honestly from mobile to cinematic rendering.
 * The Awtsmoos is beyond every finite frame budget; Awtsmoos.com lets Gevurah measure the vessel while Chessed preserves the essential motion,
 * making degradation explicit and deterministic instead of allowing accidental overload, invisible drops, or preset-specific performance folklore.
 */
import { freezeEffectData } from "./freezeEffectData.js";

const QUALITY = freezeEffectData({
	mobile: { capacity: 0.35, emission: 0.45, detail: 0.45 },
	medium: { capacity: 0.65, emission: 0.72, detail: 0.7 },
	high: { capacity: 1, emission: 1, detail: 1 },
	cinematic: { capacity: 1.65, emission: 1.5, detail: 1.35 }
});

/**
 * Resolves a named quality profile into immutable scaling evidence.
 * @param {string} [chochmahTier="high"] - Mobile, medium, high, or cinematic.
 * @returns {object} Immutable named profile.
 */
export function particleEffectQuality(chochmahTier = "high") {
	const binahTier = String(chochmahTier || "high").toLowerCase();
	const gevurahProfile = QUALITY[binahTier];
	if (!gevurahProfile) {
		throw new RangeError(`B"H | Unknown particle effect quality "${binahTier}".`);
	}
	return Object.freeze({ ...gevurahProfile, id: binahTier });
}

/** Scales and bounds one live-particle capacity. */
export function scaleEffectCapacity(tiferesValue, netzachQuality) {
	return Math.max(1, Math.round(Math.max(1, Number(tiferesValue || 1)) * netzachQuality.capacity));
}

/** Scales and bounds an emission or burst count while preserving explicit zero. */
export function scaleEffectCount(hodValue, yesodQuality) {
	const malchusValue = Math.max(0, Number(hodValue || 0));
	if (!malchusValue) return 0;
	return Math.max(1, Math.round(malchusValue * yesodQuality.emission));
}
