// B"H
// Boruch Hashem
// Blessed is He

import { fieldDeed, questGiver, resident } from './entities.js';

/**
 * @file The Malkuth finale turns memory disagreement into shared defense.
 * @description The Awtsmoos renews testimony, fragment, escalating absence, and
 * reconciliation in one chapter. Awtsmoos.com is remembered here as each wave is
 * a real public battle whose victory, not mere contact, advances the Chronicle.
 */

function wave(id, x, opponentId, level, visual) {
	return {
		id,
		name: `Blankling Wave ${id.at(-1)}`,
		type: 'battle_event',
		uu: String.fromCodePoint(0xE460 + x),
		visual,
		x,
		y: 5,
		opponents: [{ id: opponentId, level }],
		questEvent: {
			type: 'survive_waves',
			targetId: 'blankling_attack',
			quantity: 1
		}
	};
}

export const malkuthFinaleInteractables = Object.freeze({
	master_oren_finale: questGiver(
		'master_oren',
		'Master Oren',
		'👴',
		4,
		5,
		'campaign_malkuth_08',
		'Four memories disagree because their relationship was erased. Hear them before defending the page.'
	),
	elder_miriam: fieldDeed(
		'👵', 6, 5, 'speak_group', 'malkuth_elders',
		'Miriam remembers the fountain before the village had walls.'
	),
	elder_azriel: fieldDeed(
		'👴', 8, 5, 'speak_group', 'malkuth_elders',
		'Azriel remembers the wall being raised to protect the fountain.'
	),
	elder_devorah: fieldDeed(
		'👵', 10, 5, 'speak_group', 'malkuth_elders',
		'Devorah remembers children carrying water through the unfinished gate.'
	),
	elder_shimon: fieldDeed(
		'👴', 12, 5, 'speak_group', 'malkuth_elders',
		'Shimon remembers all three accounts and the page that joined them.'
	),
	first_page_fragment: {
		id: 'first_page_fragment',
		name: 'First Page Fragment',
		type: 'pickup',
		uu: '\uE46D',
		visual: '📜',
		x: 14,
		y: 5,
		pickup: 'first_page_fragment',
		quantity: 1,
		requiredObjective: {
			type: 'collect_item',
			targetId: 'first_page_fragment'
		},
		dialogue: {
			start: [
				'Beneath the fountain stone, the missing relationship waits in ink.'
			]
		}
	},
	blankling_wave_1: wave(
		'blankling_wave_1', 16, 'blankling_scout', 5, '▫️'
	),
	blankling_wave_2: wave(
		'blankling_wave_2', 18, 'blankling_silencer', 6, '◽'
	),
	blankling_wave_3: wave(
		'blankling_wave_3', 20, 'blankling_guardian', 7, '◻️'
	),
	pale_editor_projection: fieldDeed(
		'◻️',
		22,
		5,
		'discover_lore',
		'pale_editor_projection',
		'The Pale Editor offers peace without relationship. The village refuses together.'
	),
	fountain_witness: resident(
		'fountain_witness',
		'The Dry Fountain Stone',
		'🪨',
		12,
		7,
		'The basin waits for the missing relationship that once taught its water to flow.'
	)
});
