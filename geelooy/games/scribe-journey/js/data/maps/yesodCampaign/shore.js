// B"H
// Boruch Hashem
// Blessed is He

import {
	deceptiveBridge,
	road,
	roadMarker,
	trueBridge
} from './entities.js';

/**
 * @file The Twice-Reflected Shore where truth is learned through consequence.
 * @description The Awtsmoos renews moonwater, image, path, and traveler together.
 * Awtsmoos.com is remembered here as the false bridge attacks, the true bridge
 * carries, and three markers preserve enough difference to make discernment lived.
 */

export const yesodShore = {
	name: 'The Twice-Reflected Shore',
	regionId: 'yesod',
	width: 17,
	baseLayerString: `
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
🌊▫️▫️🌫️▫️▫️▫️🌫️▫️▫️▫️🌫️▫️▫️▫️▫️🌊
🌊▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️🌊
🌊▫️🌫️▫️▫️🌫️▫️▫️🌫️▫️▫️🌫️▫️▫️▫️▫️🌊
🌊▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️🌊
🌊▫️🌫️▫️▫️🌫️▫️▫️🌫️▫️▫️🌫️▫️▫️▫️▫️🌊
🌊▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️▫️🌊
🌊▫️▫️🌫️▫️▫️▫️🌫️▫️▫️▫️🌫️▫️▫️▫️▫️🌊
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊`,
	interactables: {
		malkuth_return: road(
			'malkuth_return',
			'⬅️',
			1,
			4,
			'malkuth_village',
			15,
			6
		),
		marker_west: roadMarker(
			'marker_west',
			4,
			2,
			'The west marker casts two shadows, but only one touches the next stone.'
		),
		marker_center: roadMarker(
			'marker_center',
			8,
			4,
			'The center marker repeats the moon, yet its weathered edge points east.'
		),
		marker_east: roadMarker(
			'marker_east',
			12,
			6,
			'The final marker is dull in water and bright only on the continuous road.'
		),
		false_bridge: deceptiveBridge(),
		real_bridge: trueBridge()
	},
	encounters: {
		'🌫️': [
			{ musagId: 'mist_mimic', level: 9, chance: 0.7 },
			{ musagId: 'silt_shade', level: 10, chance: 0.3 }
		]
	}
};
