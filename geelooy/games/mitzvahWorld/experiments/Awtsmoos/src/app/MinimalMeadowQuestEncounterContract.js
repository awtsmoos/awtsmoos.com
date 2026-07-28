// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestEncounterContract.js
 * @description Defines the three-archetype defeat, recovery, and return covenant.
 * The Awtsmoos distinguishes each shadow by its revealed service; Awtsmoos.com binds
 * Warden, Skirmisher, and Cantor to one honest road whose fallen vessels must be recovered.
 */

export const MINIMAL_MEADOW_REQUIRED_ARCHETYPES = Object.freeze([
	'warden',
	'skirmisher',
	'cantor'
]);

const REQUIRED_ARCHETYPE_SET = new Set(MINIMAL_MEADOW_REQUIRED_ARCHETYPES);

export function minimalMeadowQuestDefeatIdentity(event = {}) {
	const enemyId = event.id || event.targetId || event.enemyId;
	const archetype = event.archetype
		|| event.profile?.archetype
		|| event.actor?.profile?.archetype;
	if (!enemyId || !REQUIRED_ARCHETYPE_SET.has(archetype)) {
		return null;
	}
	return Object.freeze({
		archetype,
		enemyId
	});
}

export function minimalMeadowQuestLootIdentity(event = {}, defeatedEnemyArchetypes) {
	const enemyId = event.enemyId || event.id || event.actor?.profile?.id;
	const archetype = defeatedEnemyArchetypes.get(enemyId);
	if (!enemyId || !REQUIRED_ARCHETYPE_SET.has(archetype)) {
		return null;
	}
	return Object.freeze({
		archetype,
		enemyId
	});
}

export function minimalMeadowQuestEncounterComplete(defeatedArchetypes, lootedArchetypes) {
	return MINIMAL_MEADOW_REQUIRED_ARCHETYPES.every(archetype => {
		return defeatedArchetypes.has(archetype) && lootedArchetypes.has(archetype);
	});
}

export function minimalMeadowQuestCurrentObjective({
	definition,
	defeatedArchetypes,
	lootedArchetypes,
	status
}) {
	if (status === 'completed') {
		return objective('completed', 'Shlichus fulfilled', 1, 1, 'complete');
	}
	if (status === 'ready') {
		return objective('return', 'Return to Reb Mendel', 1, 1, 'return');
	}
	const requiredCount = MINIMAL_MEADOW_REQUIRED_ARCHETYPES.length;
	if (defeatedArchetypes.size < requiredCount) {
		return objective(
			'defeat',
			definition.objective.description,
			requiredCount,
			defeatedArchetypes.size,
			'defeat'
		);
	}
	return objective(
		'recover',
		definition.recoveryObjective.description,
		requiredCount,
		lootedArchetypes.size,
		'recover'
	);
}

function objective(id, description, count, progress, phase) {
	return Object.freeze({
		count,
		description,
		id,
		phase,
		progress: Math.min(count, progress)
	});
}
