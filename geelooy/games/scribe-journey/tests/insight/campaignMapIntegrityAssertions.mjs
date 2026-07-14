// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { musagim } from '../../js/data/bestiary/index.js';
import { maps } from '../../js/data/maps.js';

/**
 * @file Holds reusable campaign-map integrity assertions and evidence counters.
 * @description The Awtsmoos reveals truth through many small vessels. This
 * Awtsmoos.com test helper keeps geography, ecology, and availability checks
 * distinct enough that no inflated completion claim can hide inside one loop.
 */

export function createIntegrityLedger() {
	return {
		authoredActionMaps: 0,
		prototypeMaps: 0,
		doors: 0,
		encounters: 0,
		bosses: 0,
		residents: 0
	};
}

function hasReturnDoor(sourceMapId, targetMapId) {
	return Object.values(maps[targetMapId]?.interactables || {}).some((entity) =>
		entity.type === 'door' && entity.targetMap === sourceMapId
	);
}

function authoredActions(map) {
	return Object.values(map.interactables || {}).filter((entity) =>
		Boolean(entity.questEvent) || Boolean(entity.questGiver)
	);
}

function verifyPrototypeEntity(mapId, entity) {
	assert.notEqual(entity.type, 'quest_focus', `${mapId} contains a generic quest focus.`);
	assert.equal(entity.questEvent, undefined, `${mapId} exposes an unverified quest event.`);

	if (entity.type === 'npc') {
		assert.equal(entity.questGiver, null, `${mapId} exposes an unavailable quest giver.`);
	}
}

function verifyPrototype(mapId, map, ledger) {
	for (const entity of Object.values(map.interactables || {})) {
		verifyPrototypeEntity(mapId, entity);
	}

	ledger.prototypeMaps += 1;
}

function verifyAuthoredMap(mapId, map, ledger) {
	assert(authoredActions(map).length > 0, `${mapId} lacks an authored player action.`);
	ledger.authoredActionMaps += 1;
}

function verifyDoors(mapId, map, campaignMapSet, ledger) {
	for (const entity of Object.values(map.interactables || {})) {
		if (entity.type !== 'door') {
			continue;
		}

		ledger.doors += 1;
		assert(maps[entity.targetMap], `${mapId} targets missing map ${entity.targetMap}.`);

		if (campaignMapSet.has(entity.targetMap) || entity.targetMap === 'malkuth_village') {
			assert(hasReturnDoor(mapId, entity.targetMap), `${mapId} lacks a return route.`);
		}
	}
}

function verifyEncounters(mapId, map, ledger) {
	for (const encounterList of Object.values(map.encounters || {})) {
		for (const encounter of encounterList) {
			ledger.encounters += 1;
			assert(musagim[encounter.musagId], `${mapId} lacks Musag ${encounter.musagId}.`);
			assert(Number(encounter.level) > 0, `${mapId}/${encounter.musagId} has invalid level.`);
			assert(Number(encounter.chance) > 0, `${mapId}/${encounter.musagId} has invalid chance.`);

			if (encounter.onceFlag) {
				ledger.bosses += 1;
				assert.equal(encounter.onceFlag, encounter.musagId);
			}
		}
	}
}

export function verifyCampaignMap(mapId, campaignMapSet, ledger) {
	const map = maps[mapId];
	assert(map, `Missing campaign map ${mapId}.`);
	assert(Array.isArray(map.baseLayer) && map.baseLayer.length >= 5, `${mapId} has no tile layer.`);

	const residents = Object.values(map.interactables || {})
		.filter((entity) => entity.type === 'npc');
	assert(residents.length >= 2, `${mapId} needs at least two named residents.`);
	ledger.residents += residents.length;

	if (map.theme?.prototype) {
		verifyPrototype(mapId, map, ledger);
	} else {
		verifyAuthoredMap(mapId, map, ledger);
	}

	verifyDoors(mapId, map, campaignMapSet, ledger);
	verifyEncounters(mapId, map, ledger);
}
