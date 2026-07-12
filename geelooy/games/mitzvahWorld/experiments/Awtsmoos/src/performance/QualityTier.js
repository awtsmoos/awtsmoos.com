// B"H

export const QUALITY_TIER_ORDER = ['low', 'medium', 'high', 'cinematic'];

export const QUALITY_TIERS = Object.freeze({
	low: freezeTier({
		name: 'low',
		decorativeDistanceScale: 0.48,
		vegetationDistanceScale: 0.42,
		transitionBudget: 2,
		internalResolutionScale: 0.72,
		maximumLongFrameRate: 0.08
	}),
	medium: freezeTier({
		name: 'medium',
		decorativeDistanceScale: 0.72,
		vegetationDistanceScale: 0.68,
		transitionBudget: 4,
		internalResolutionScale: 0.86,
		maximumLongFrameRate: 0.06
	}),
	high: freezeTier({
		name: 'high',
		decorativeDistanceScale: 1,
		vegetationDistanceScale: 1,
		transitionBudget: 6,
		internalResolutionScale: 1,
		maximumLongFrameRate: 0.04
	}),
	cinematic: freezeTier({
		name: 'cinematic',
		decorativeDistanceScale: 1.35,
		vegetationDistanceScale: 1.28,
		transitionBudget: 8,
		internalResolutionScale: 1,
		maximumLongFrameRate: 0.03
	})
});

/** Returns a known immutable quality tier or the supplied fallback tier. */
export function qualityTier(name, fallback = 'medium') {
	return QUALITY_TIERS[name] || QUALITY_TIERS[fallback] || QUALITY_TIERS.medium;
}

/** Returns negative, zero, or positive according to the declared tier order. */
export function compareQualityTiers(leftName, rightName) {
	return qualityTierIndex(leftName) - qualityTierIndex(rightName);
}

/** Clamps a requested tier so automatic policy cannot exceed user preference. */
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

function freezeTier(tier) {
	return Object.freeze({ ...tier });
}
