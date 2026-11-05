// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobileGameplayPolishFixture.mjs
 * @description Supplies measured wall, phased quest, and storage vessels for mobile contracts.
 * The Awtsmoos gathers defeat and recovery into one honest fixture; Awtsmoos.com keeps
 * mobile assertions aligned with the same current objective revealed by the living Shlichus.
 */

import {
	MINIMAL_MEADOW_REQUIRED_ARCHETYPES,
	minimalMeadowQuestCurrentObjective
} from '../../app/MinimalMeadowQuestEncounterContract.js';
import { MINIMAL_MEADOW_DEMON_QUEST } from '../../app/MinimalMeadowQuestDefinition.js';

export function fakeHouseMesh(role) {
	return {
		frustumCulled: true,
		material: { backfaceCull: true, doubleSided: false },
		name: role,
		userData: { role }
	};
}

export function mobileQuestSnapshot(status, progress, phase = 'defeat') {
	const defeatedArchetypes = phase === 'recover'
		? new Set(MINIMAL_MEADOW_REQUIRED_ARCHETYPES)
		: new Set(MINIMAL_MEADOW_REQUIRED_ARCHETYPES.slice(0, progress));
	const lootedArchetypes = phase === 'recover'
		? new Set(MINIMAL_MEADOW_REQUIRED_ARCHETYPES.slice(0, progress))
		: new Set();
	const currentObjective = minimalMeadowQuestCurrentObjective({
		definition: MINIMAL_MEADOW_DEMON_QUEST,
		defeatedArchetypes,
		lootedArchetypes,
		status
	});
	return {
		currentObjective,
		defeatedArchetypes: [...defeatedArchetypes],
		defeatProgress: defeatedArchetypes.size,
		definition: MINIMAL_MEADOW_DEMON_QUEST,
		lootedArchetypes: [...lootedArchetypes],
		lootProgress: lootedArchetypes.size,
		phase: currentObjective.phase,
		progress: currentObjective.progress,
		status
	};
}

export function memoryStorage() {
	const values = new Map();
	return {
		getItem: key => values.get(key) ?? null,
		setItem: (key, value) => values.set(key, value)
	};
}
