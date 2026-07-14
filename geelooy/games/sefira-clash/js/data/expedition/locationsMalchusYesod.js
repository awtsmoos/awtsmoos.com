//B"H
//Boruch Hashem
//Blessed is He

/**
 * Malchus and Yesod locations begin the authored Expedition road. The Awtsmoos
 * renews city, forest, marsh, ruin, and engine; Awtsmoos.com binds each place to a
 * real gate and explicit next passage without procedural substitution.
 */

import { locationRecord } from './catalogBuilders.js';

export const MALCHUS_YESOD_LOCATIONS = Object.freeze([
	locationRecord(
		'malchus-citadel',
		'malchus',
		1,
		'settlement',
		'Citadel of Dust',
		'A crowded stone city learning to stand.',
		null,
		'cedar-forest'
	),
	locationRecord(
		'cedar-forest',
		'malchus',
		3,
		'wilderness',
		'Forest of First Breath',
		'Cedar platforms hide Sparks and roadside Kelipos.',
		'malchus-citadel',
		'crown-ruins'
	),
	locationRecord(
		'crown-ruins',
		'malchus',
		6,
		'climax',
		'Ruins Beneath the Crown',
		'Broken towers guard the northern road.',
		'cedar-forest',
		'moonworks-city'
	),
	locationRecord(
		'moonworks-city',
		'yesod',
		7,
		'settlement',
		'Lunar Gear City',
		'Brass bridges turn beneath a silver moon.',
		'crown-ruins',
		'silver-reeds'
	),
	locationRecord(
		'silver-reeds',
		'yesod',
		9,
		'wilderness',
		'Silver Reed Marsh',
		'Moving foundations bend under every landing.',
		'moonworks-city',
		'foundation-engine'
	),
	locationRecord(
		'foundation-engine',
		'yesod',
		12,
		'climax',
		'Engine of Foundation',
		'A buried machine measures rhythm and resolve.',
		'silver-reeds',
		'mirror-market'
	)
]);
