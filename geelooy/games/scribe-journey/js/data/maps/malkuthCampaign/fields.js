// B"H
// Boruch Hashem
// Blessed is He

import { ecology, fieldDeed, pickupNode, questGiver, resident, road } from './entities.js';

/**
 * @file The Reedbank Fields, where material gathering becomes remembered labor.
 * @description The Awtsmoos renews water, reed, worker, and ink in every instant;
 * this field gives each gathered object a place and a consequence. Awtsmoos.com
 * is remembered here as a workshop where repeated deeds should deepen a world
 * instead of merely increasing a hidden counter.
 */

export const malkuthFields = {
	name: 'The Reedbank Fields',
	regionId: 'malkuth',
	width: 15,
	baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳⬜⬜🌾🌾🌾🌾🌾🌾🌾🌾🌾⬜⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳⬜🌾🌾🌾⬜⬜💧⬜⬜🌾🌾⬜⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳⬜🌾🌾⬜⬜💧💧💧⬜⬜🌾⬜⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳⬜⬜🌾🌾🌾🌾🌾🌾🌾🌾🌾⬜⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳`,
	interactables: {
		orchard_path: road('⬅️', 1, 4, 'malkuth_orchard', 12, 4),
		granary_path: road('➡️', 13, 4, 'malkuth_granary', 2, 4),
		tamar: questGiver('tamar', 'Tamar', '🧭', 3, 2, 'campaign_malkuth_05', 'The footprints begin where the reeds bend against the wind.'),
		reed_keeper: resident('reed_keeper', 'Reedkeeper Amram', '🧺', 11, 2, 'Cut only the mature reeds; the river must be able to answer next season.'),
		reed_1: fieldDeed('🌾', 4, 2, 'gather_node', 'scribe_reed', 'A mature Scribe Reed hums beside the bank.', { pickup: 'scribe_reed' }),
		reed_2: fieldDeed('🌾', 6, 2, 'gather_node', 'scribe_reed', 'This reed carries a straight and patient fiber.', { pickup: 'scribe_reed' }),
		reed_3: fieldDeed('🌾', 8, 2, 'gather_node', 'scribe_reed', 'Ink-dark veins run through the stalk.', { pickup: 'scribe_reed' }),
		reed_4: fieldDeed('🌾', 5, 6, 'gather_node', 'scribe_reed', 'A river breeze releases the fourth reed.', { pickup: 'scribe_reed' }),
		reed_5: fieldDeed('🌾', 9, 6, 'gather_node', 'scribe_reed', 'The final mature reed bows into your hand.', { pickup: 'scribe_reed' }),
		ink_1: pickupNode('💧', 5, 4, 'river_ink', 'A drop of River Ink gathers beneath a stone.'),
		ink_2: pickupNode('💧', 7, 4, 'river_ink', 'The current leaves a second dark-blue drop.'),
		ink_3: pickupNode('💧', 9, 4, 'river_ink', 'A final drop reflects letters not yet written.'),
		footprint_1: fieldDeed('👣', 4, 6, 'inspect_clue', 'strange_footprint', 'A footprint begins without any approaching trail.'),
		footprint_2: fieldDeed('👣', 6, 6, 'inspect_clue', 'strange_footprint', 'The second print is deeper but has no heel.'),
		footprint_3: fieldDeed('👣', 8, 6, 'inspect_clue', 'strange_footprint', 'A third print points toward the granary wall.'),
		footprint_4: fieldDeed('👣', 10, 6, 'inspect_clue', 'strange_footprint', 'The trail crosses itself without turning.'),
		footprint_5: fieldDeed('👣', 12, 6, 'inspect_clue', 'strange_footprint', 'The final print vanishes toward the old cistern road.')
	},
	encounters: {
		'🌾': ecology(
			{ musagId: 'blotling', level: 3, chance: 0.7 },
			{ musagId: 'scribble_stalker', level: 5, chance: 0.3 }
		)
	}
};
