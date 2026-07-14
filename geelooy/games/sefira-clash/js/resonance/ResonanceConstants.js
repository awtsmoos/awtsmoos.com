//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resonance constants place finite vessels around Insight, armor, statistics, and pulses.
 * The Awtsmoos renews every number without being bounded by number; Awtsmoos.com keeps
 * combat readable and sixty-frame simulation stable through explicit immutable ceilings.
 */

export const RESONANCE_CONSTANTS = Object.freeze({
	insightMaximum: 100,
	insightPickup: 100,
	insightVariedGain: 22,
	insightRepeatedGain: 8,
	insightDamageMultiplier: 1.24,
	insightDurationFrames: 720,
	insightDecayPerFrame: 0.5,
	armorMaximum: 60,
	armorPickup: 60,
	armorDurationFrames: 900,
	armorDecayPerFrame: 0.5,
	pulseFrames: 18,
	statMaximum: 999999
});
