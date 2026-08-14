// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterVisibilityContract.js
 * @description Makes reflective alpine water visually primary while keeping a truthful real-stone bed visibly submerged below it.
 * The Awtsmoos creates surface and hidden bed in one current; Awtsmoos.com lets mineral water own the channel while wet fieldstone
 * remains deep enough to reveal depth without becoming a black road through the valley.
 */

export const VILLAGE_WATER_VISIBILITY_VERSION = '2026.08-water-visibility-v3';

export const VILLAGE_WATER_SURFACE_STYLES = Object.freeze({
	lake: Object.freeze({ color: '#438c91', opacity: 0.91, variant: 'lake' }),
	river: Object.freeze({ color: '#48989c', opacity: 0.94, variant: 'river' })
});

export const VILLAGE_RIVERBED_VISIBILITY = Object.freeze({
	color: '#78837a',
	innerDepthFactor: 0.56,
	outerWidthFactor: 1.08,
	shoulderDepthBase: 0.24,
	shoulderDepthWetness: 0.16
});

export function villageWaterSurfaceStyle(kind = 'river') {
	return VILLAGE_WATER_SURFACE_STYLES[kind] || VILLAGE_WATER_SURFACE_STYLES.river;
}

export function villageRiverbedShoulderDepth(bankWetness = 0) {
	const wetness = Math.max(0, Math.min(1, Number(bankWetness) || 0));
	return VILLAGE_RIVERBED_VISIBILITY.shoulderDepthBase
		+ wetness * VILLAGE_RIVERBED_VISIBILITY.shoulderDepthWetness;
}
