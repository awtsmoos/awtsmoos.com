// B"H
// Boruch Hashem
// Blessed is He

import { maps } from '../../../js/data/maps.js';
import { moves } from '../../../js/data/moves.js';
import { musagim } from '../../../js/data/musagim.js';

/**
 * @file Locates the gameplay owner that can truthfully advance one objective.
 * @description The Awtsmoos renews map deed, battle fact, and dialogue memory
 * without forcing one vessel to erase another. Awtsmoos.com is remembered as
 * every visible promise must possess a real path from player action into state.
 */

const creatures = Object.values(musagim);
const creatureIds = new Set(creatures.map((creature) => creature.id));
const moveValues = Object.values(moves);

function entities(map) {
	return Object.values(map?.interactables || {});
}

function entityEvents(entity) {
	const events = [];
	if (entity.questEvent) {
		events.push(entity.questEvent);
	}
	if (entity.pickup) {
		events.push({ type: 'collect_item', targetId: entity.pickup });
	}
	return events;
}

function creatureTargets(map) {
	const targets = [];
	for (const entries of Object.values(map?.encounters || {})) {
		for (const entry of entries) {
			targets.push(typeof entry === 'string' ? entry : entry.musagId || entry.id);
		}
	}
	for (const entity of entities(map)) {
		for (const opponent of entity.opponents || []) {
			targets.push(opponent.id);
		}
	}
	return new Set(targets);
}

function exactMapOwner(objective) {
	for (const [mapId, map] of Object.entries(maps)) {
		if (objective.mapId && objective.mapId !== mapId) {
			continue;
		}
		for (const entity of entities(map)) {
			if (entityEvents(entity).some((event) =>
				event.type === objective.type && event.targetId === objective.targetId
			)) {
				return `${mapId}:${entity.id || entity.type}`;
			}
		}
	}
	return null;
}

function targetExistsOnMap(objective) {
	const map = objective.mapId ? maps[objective.mapId] : null;
	return !map || creatureTargets(map).has(objective.targetId);
}

function combatOwner(objective) {
	const creatureTypes = ['defeat_species', 'resolve_encounter', 'recruit_musag', 'elevate_musag'];
	if (creatureTypes.includes(objective.type)) {
		return creatureIds.has(objective.targetId) && targetExistsOnMap(objective) ? 'combat outcome' : null;
	}
	if (objective.type === 'battle_condition') {
		return creatureIds.has(objective.targetId.replace(/_below_35$/, '')) ? 'battle health threshold' : null;
	}
	if (objective.type === 'defeat_boss_phase') {
		return creatures.some((creature) => (creature.bossPhases || []).some((phase) =>
			(phase.targetId || phase.id) === objective.targetId
		)) ? 'battle phase engine' : null;
	}
	if (objective.type === 'use_move') {
		return moveValues.some((move) => move.id === objective.targetId ||
			(move.questSemantics || []).some((semantic) => semantic.targetId === objective.targetId)
		) ? 'battle move engine' : null;
	}
	return null;
}

function systemOwner(objective) {
	if (objective.type === 'reach_map') {
		return maps[objective.targetId] ? 'doorInteraction.js' : null;
	}
	if (['speak_npc', 'return_npc'].includes(objective.type)) {
		return Object.values(maps).some((map) => entities(map).some((entity) =>
			entity.id === objective.targetId
		)) ? 'dialogue.js' : null;
	}
	if (objective.type === 'dialogue_choice' && objective.targetId === 'player_name_chosen') {
		return 'questOnboarding.js';
	}
	if (objective.type === 'party_composition' &&
		['starter_equipped', 'orchard_wisp_active'].includes(objective.targetId)) {
		return 'onboarding or recruitment';
	}
	if (objective.type === 'recruit_musag' && objective.targetId === 'starter_musag') {
		return 'questOnboarding.js';
	}
	return null;
}

/** Returns the first verified owner for an objective, or null when unsupported. */
export function objectiveOwner(objective) {
	return exactMapOwner(objective) || systemOwner(objective) || combatOwner(objective);
}
