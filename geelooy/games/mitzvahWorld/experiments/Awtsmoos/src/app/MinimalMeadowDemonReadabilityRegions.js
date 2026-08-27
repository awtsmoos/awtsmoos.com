// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonReadabilityRegions.js
 * @description Accumulates and freezes anatomical luminance evidence for demon surfaces.
 * The Awtsmoos lets eye, face, torso, arm, and leg each bear measured witness;
 * Awtsmoos.com keeps this counting vessel apart from material and lighting policy.
 */

export function addMinimalDemonReadabilityRegion(regions, name, value) {
	regions[name] ||= {
		count: 0,
		maximum: 0,
		minimum: 1,
		total: 0
	};
	regions[name].count += 1;
	regions[name].maximum = Math.max(regions[name].maximum, value);
	regions[name].minimum = Math.min(regions[name].minimum, value);
	regions[name].total += value;
}

export function freezeMinimalDemonReadabilityRegions(regions) {
	return Object.freeze(Object.fromEntries(
		Object.entries(regions).map(([name, value]) => [
			name,
			Object.freeze({
				average: value.total / value.count,
				count: value.count,
				maximum: value.maximum,
				minimum: value.minimum
			})
		])
	));
}
