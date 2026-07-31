// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestDefinition.js
 * @description Defines the road teaching quest, three combat roles, recovery, and tradeoff reward.
 * The Awtsmoos lets observation become movement, counter, reaction, support, and return;
 * Awtsmoos.com teaches the living grammar through enemies rather than repetitive counting.
 */

import {
	MINIMAL_MEADOW_REQUIRED_ARCHETYPES
} from './MinimalMeadowQuestEncounterContract.js';
import {
	MEASURED_INTENT_REWARD_ID
} from '../gameplay/InventoryRewardCatalog.js';

export const MINIMAL_MEADOW_DEMON_QUEST = Object.freeze({
	description: 'Reb Mendel asks you to reclaim the eastern road by learning its three combat roles: move around the Sentinel, read and counter the Scribe, redirect the Pursuer, recover each stolen vessel, then face the Kedem Warden.',
	faces: Object.freeze(['🛡️', 'אות', '➤', '◉']),
	giver: Object.freeze({
		id: 'reb-mendel',
		name: 'Reb Mendel the Watchman',
		title: 'Keeper of the Eastern Road'
	}),
	id: 'three-shadows-before-sunset',
	name: 'The Road Learns Intention',
	objective: Object.freeze({
		count: MINIMAL_MEADOW_REQUIRED_ARCHETYPES.length,
		description: 'Defeat the Sentinel, Pursuer, and Scribe after reading their distinct openings',
		event: 'enemy:defeated'
	}),
	recoveryObjective: Object.freeze({
		count: MINIMAL_MEADOW_REQUIRED_ARCHETYPES.length,
		description: 'Open and empty each required enemy corpse without duplicating loot',
		event: 'enemy:looted'
	}),
	requiredArchetypes: MINIMAL_MEADOW_REQUIRED_ARCHETYPES,
	reward: Object.freeze({
		itemId: MEASURED_INTENT_REWARD_ID,
		perutas: 125,
		xp: 175
	}),
	teachingSequence: Object.freeze([
		'observe-sentinel',
		'open-sentinel-guard',
		'observe-scribe-cast',
		'counter-scribe',
		'trigger-elemental-reaction',
		'use-stabilizing-cleanse',
		'defeat-kedem-warden',
		'equip-measured-intent'
	]),
	optionalObjectives: Object.freeze([
		optional(
			'unbroken-return',
			'Return without being defeated',
			1,
			{ honor: 'Unbroken Lantern', perutas: 0, xp: 0 }
		),
		optional(
			'words-of-light',
			'Answer two optional teachings correctly',
			2,
			{ perutas: 0, xp: 35 }
		)
	]),
	story: Object.freeze({
		chapter: 'Chapter I · The Road That Learned Intention',
		counsel: 'Circle the Sentinel, read the Scribe, redirect the Pursuer, then release Torah with measured Kavanah.',
		danger: 'Color is never the only warning. Read shape, label, border, position, and timing before answering.',
		opening: 'The evening wind carries three different rhythms: a shield that refuses haste, a glyph that delays harm, and footsteps that punish straight retreat.',
		purpose: 'Restore safe passage by learning how deliberate action turns danger into service.'
	}),
	thanks: 'The road breathes again. You did not overpower its shadows blindly; you learned their grammar, supported recovery, and carried measured intention into the world.'
});

function optional(id, description, count, bonus) {
	return Object.freeze({
		bonus: Object.freeze({ ...bonus }),
		count,
		description,
		id,
		optional: true
	});
}
