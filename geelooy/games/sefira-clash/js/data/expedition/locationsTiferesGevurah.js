//B"H
//Boruch Hashem
//Blessed is He

/**
 * Tiferes and Gevurah locations carry harmony into disciplined fire. The Awtsmoos
 * renews city, gardens, sanctum, forge, ironwood, and furnace; Awtsmoos.com binds
 * each authored place to a real gate and one explicit next road.
 */

import { locationRecord as L } from './catalogBuilders.js';

export const TIFERES_GEVURAH_LOCATIONS = Object.freeze([
	L(
		'harmony-city',
		'tiferes',
		25,
		'settlement',
		'City of Balanced Light',
		'Gardens, smiths, and scholars share one central plaza.',
		'endless-causeway',
		'sunlit-gardens'
	),
	L(
		'sunlit-gardens',
		'tiferes',
		27,
		'wilderness',
		'Sunlit Gardens',
		'Mercy and discipline meet among suspended terraces.',
		'harmony-city',
		'heart-sanctum'
	),
	L(
		'heart-sanctum',
		'tiferes',
		30,
		'climax',
		'Sanctum of the Heart',
		'A beautiful arena demands complete command of movement.',
		'sunlit-gardens',
		'forgehold'
	),
	L(
		'forgehold',
		'gevurah',
		31,
		'settlement',
		'Forgehold',
		'Armorers hammer law into glowing metal.',
		'heart-sanctum',
		'ironwood'
	),
	L(
		'ironwood',
		'gevurah',
		33,
		'wilderness',
		'Ironwood',
		'Black trees and furnace vents punish careless routes.',
		'forgehold',
		'furnace-depths'
	),
	L(
		'furnace-depths',
		'gevurah',
		36,
		'climax',
		'Furnace Depths',
		'Narrow machinery tests timing under pressure.',
		'ironwood',
		'river-city'
	)
]);
