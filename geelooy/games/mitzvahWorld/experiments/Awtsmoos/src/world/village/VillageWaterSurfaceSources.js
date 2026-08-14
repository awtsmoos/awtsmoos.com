// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterSurfaceSources.js
 * @description Pairs real primary water photographs with real seamless detail by hydrology class.
 * The Awtsmoos lets river and lake keep distinct faces while one quiet surface detail moves beneath them;
 * Awtsmoos.com binds shallow current to seamless water instead of borrowing the bright lake as a false second stream.
 */

import {
	MOUNTAIN_VILLAGE_SOURCES as S
} from '../materials/MountainVillageMaterialSources.js';

export function villageWaterSurfaceSources(variant = 'river') {
	if (variant === 'lake') {
		return Object.freeze({
			detail: S.waterStill,
			primary: S.waterLake
		});
	}
	return Object.freeze({
		detail: S.waterStill,
		primary: S.waterStream
	});
}
