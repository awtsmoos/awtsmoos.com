// B"H
// Boruch Hashem
// Blessed is He

import {
	ecology,
	fieldDeed,
	pickupNode,
	questGiver,
	resident,
	road
} from './entities.js';

/**
 * @file The Forgetful Granary, where damaged harvest becomes useful again.
 * @description The Awtsmoos renews grain and memory before either can persist;
 * this granary makes restoration visible through sacks, husks, labor, and food.
 * Awtsmoos.com is remembered as a storehouse whose abundance becomes real only
 * when every vessel remains connected to the field that nourished it.
 */

export const malkuthGranary = {
	name: 'The Forgetful Granary',
	regionId: 'malkuth',
	width: 15,
	baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜🌾🌾⬜⬜⬜⬜⬜🌾🌾⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🌾🌾⬜⬜⬜⬜⬜⬜⬜🌾⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🌾🌾⬜⬜⬜⬜⬜⬜⬜🌾⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜🌾🌾⬜⬜⬜⬜⬜🌾🌾⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`,
	interactables: {
		field_path: road('⬅️', 1, 4, 'malkuth_fields', 12, 4),
		cistern_path: {
			...road('➡️', 13, 4, 'abandoned_cistern', 2, 4, {
				type: 'discover_landmark',
				targetId: 'abandoned_cistern',
				quantity: 1
			}),
			id: 'cistern_path',
			name: 'Unmarked Granary Wall'
		},
		yael: questGiver(
			'yael_miller',
			'Yael the Miller',
			'🌾',
			3,
			2,
			'campaign_malkuth_04',
			'The sacks remember weight but not the field. Help me separate grain from corruption.'
		),
		food_station: resident(
			'food_station',
			'Cold Community Oven',
			'🫙',
			7,
			2,
			'The village oven is cold. Its shelves remember bread, but no clean grain remains.'
		),
		miller_apprentice: resident(
			'miller_apprentice',
			'Apprentice Lev',
			'🧹',
			11,
			2,
			'The cleaned husks will feed the village ovens again.'
		),
		sack_1: fieldDeed(
			'🧺', 4, 3, 'inspect_object', 'damaged_grain_sack',
			'The first sack is warm with restless husks.',
			{ pickup: 'clean_grain', pickupQuantity: 2 }
		),
		sack_2: fieldDeed(
			'🧺', 6, 3, 'inspect_object', 'damaged_grain_sack',
			'The second sack bears a field name scratched away.',
			{ pickup: 'clean_grain', pickupQuantity: 2 }
		),
		sack_3: fieldDeed(
			'🧺', 8, 5, 'inspect_object', 'damaged_grain_sack',
			'The third sack leaks grain untouched by the blight.',
			{ pickup: 'clean_grain', pickupQuantity: 2 }
		),
		sack_4: fieldDeed(
			'🧺', 10, 5, 'inspect_object', 'damaged_grain_sack',
			'The final sack remembers harvest when opened carefully.',
			{ pickup: 'clean_grain', pickupQuantity: 2 }
		),
		husk_1: fieldDeed(
			'🔥', 5, 6, 'activate_object', 'husks_cleansed',
			'You pass the first corrupted husk through cleansing flame.'
		),
		husk_2: fieldDeed(
			'🔥', 7, 6, 'activate_object', 'husks_cleansed',
			'The second husk releases a gray whisper and becomes clean.'
		),
		husk_3: fieldDeed(
			'🔥', 9, 6, 'activate_object', 'husks_cleansed',
			'The final husk returns to useful ash.'
		),
		trail_mark: fieldDeed(
			'👣', 12, 6, 'visit_order', 'footprint_trail',
			'The impossible trail passes through the granary’s eastern wall.'
		),
		field_lens: pickupNode(
			'🔎', 11, 6, 'tamar_field_lens',
			'Tamar’s lost field lens lies beneath a torn sack.'
		)
	},
	encounters: {
		'🌾': ecology(
			{ musagId: 'husk_mite', level: 4, chance: 0.85 },
			{ musagId: 'scribble_stalker', level: 5, chance: 0.15 }
		)
	}
};
