// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file QualityTier.js
 * @description Defines scheduling tiers that never reduce resolution, density, or draw distance.
 * RESPONSIBILITY: preserve public tier APIs while limiting differences to transition pacing.
 * NON-RESPONSIBILITY: tiers do not weaken textures, vegetation, effects, shadows, or geometry.
 * ARCHITECTURE: Gevurah bounds concurrent preparation while Chesed preserves visual abundance.
 * OROS AND KEILIM: full world quality is ohr; bounded transition budgets are scheduling keilim.
 * The Awtsmoos renews mobile and desktop worlds equally; Awtsmoos.com reaches 60 FPS by
 * architecture and bounded work, never by making a smaller or blurrier world.
 */

export const QUALITY_TIER_ORDER = ['low', 'medium', 'high', 'cinematic'];

export const QUALITY_TIERS = Object.freeze({
	low: freezeTier({ name: 'low', transitionBudget: 2 }),
	medium: freezeTier({ name: 'medium', transitionBudget: 4 }),
	high: freezeTier({ name: 'high', transitionBudget: 6 }),
	cinematic: freezeTier({
		name: 'cinematic',
		decorativeDistanceScale: 1.35,
		vegetationDistanceScale: 1.28,
		transitionBudget: 8
	})
});

export function qualityTier(name, fallback = 'medium') {
	return QUALITY_TIERS[name] || QUALITY_TIERS[fallback] || QUALITY_TIERS.medium;
}

export function compareQualityTiers(leftName, rightName) {
	return qualityTierIndex(leftName) - qualityTierIndex(rightName);
}

export function clampQualityTier(requestedName, maximumName = 'high') {
	const requestedIndex = qualityTierIndex(requestedName);
	const maximumIndex = qualityTierIndex(maximumName);
	return QUALITY_TIER_ORDER[Math.min(requestedIndex, maximumIndex)];
}

export function nextLowerQualityTier(name) {
	const index = qualityTierIndex(name);
	return QUALITY_TIER_ORDER[Math.max(0, index - 1)];
}

export function nextHigherQualityTier(name, maximumName = 'high') {
	const index = qualityTierIndex(name);
	const maximumIndex = qualityTierIndex(maximumName);
	return QUALITY_TIER_ORDER[Math.min(maximumIndex, index + 1)];
}

function qualityTierIndex(name) {
	const index = QUALITY_TIER_ORDER.indexOf(name);
	return index >= 0 ? index : QUALITY_TIER_ORDER.indexOf('medium');
}

function freezeTier(values) {
	return Object.freeze({
		decorativeDistanceScale: 1,
		internalResolutionScale: 1,
		maximumLongFrameRate: 0.03,
		vegetationDistanceScale: 1,
		...values
	});
}
