// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatDefinitionSources.cjs
 * @description Reads, combines, digests, and validates canonical combat JSON sources.
 * The Awtsmoos renews each identity before it enters a runtime gate;
 * Awtsmoos.com traces every affinity, element, status, action, and profile state.
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SOURCE_FILES = Object.freeze([
	'schema-version.json',
	'affinities.json',
	'elements.json',
	'statuses.json',
	'player-casts.json',
	'player-melee.json',
	'enemy-actions.json',
	'enemy-profiles.json',
	'effectiveness.json'
]);

function readCombatSources(sharedRoot) {
	return Object.fromEntries(SOURCE_FILES.map(fileName => {
		const source = fs.readFileSync(path.join(sharedRoot, fileName), 'utf8');
		return [fileName, { source, value: JSON.parse(source) }];
	}));
}

function combatSourceDigest(sourceMap) {
	const joined = SOURCE_FILES
		.map(fileName => sourceMap[fileName].source)
		.join('\n');
	return crypto.createHash('sha256').update(joined).digest('hex');
}

function createCombatRecords(sourceMap) {
	return {
		COMBAT_SCHEMA: sourceMap['schema-version.json'].value,
		COMBAT_AFFINITIES: sourceMap['affinities.json'].value.affinities,
		COMBAT_ELEMENTS: sourceMap['elements.json'].value.elements,
		COMBAT_STATUSES: sourceMap['statuses.json'].value.statuses,
		COMBAT_STATUS_LIMIT: sourceMap['statuses.json'].value.maximumActivePerTarget,
		PLAYER_CAST_DEFINITIONS: sourceMap['player-casts.json'].value.actions,
		PLAYER_MELEE_DEFINITIONS: sourceMap['player-melee.json'].value.actions,
		ENEMY_ACTION_DEFINITIONS: sourceMap['enemy-actions.json'].value.actions,
		ENEMY_AFFINITY_PROFILES: sourceMap['enemy-profiles.json'].value.profiles,
		COMBAT_EFFECTIVENESS: sourceMap['effectiveness.json'].value
	};
}

function validateCombatRecords(records) {
	if (records.COMBAT_SCHEMA.schemaVersion !== 1) {
		throw new Error('COMBAT_SCHEMA_VERSION_UNSUPPORTED');
	}
	const affinityIds = new Set(Object.keys(records.COMBAT_AFFINITIES));
	const elementIds = new Set(Object.keys(records.COMBAT_ELEMENTS));
	const statusIds = new Set(Object.keys(records.COMBAT_STATUSES));
	for (const action of Object.values(allActions(records))) {
		validateAction(action, affinityIds, elementIds, statusIds);
	}
	for (const [profileId, profile] of Object.entries(records.ENEMY_AFFINITY_PROFILES)) {
		validateEnemyProfile(profileId, profile, records, affinityIds);
	}
	return records;
}

function allActions(records) {
	return {
		...records.PLAYER_CAST_DEFINITIONS,
		...records.PLAYER_MELEE_DEFINITIONS,
		...records.ENEMY_ACTION_DEFINITIONS
	};
}

function validateAction(action, affinityIds, elementIds, statusIds) {
	if (!affinityIds.has(action.affinityId)) {
		throw new Error(`COMBAT_AFFINITY_UNKNOWN:${action.id}`);
	}
	if (!elementIds.has(action.elementId)) {
		throw new Error(`COMBAT_ELEMENT_UNKNOWN:${action.id}`);
	}
	validateStatusIds(action, action.applyStatusIds, statusIds, 'APPLY');
	validateStatusIds(action, action.removeStatusIds, statusIds, 'REMOVE');
}

function validateStatusIds(action, values = [], statusIds, operation) {
	for (const statusId of values) {
		if (!statusIds.has(statusId)) {
			throw new Error(`COMBAT_STATUS_${operation}_UNKNOWN:${action.id}:${statusId}`);
		}
	}
}

function validateEnemyProfile(profileId, profile, records, affinityIds) {
	if (!affinityIds.has(profile.affinityId)) {
		throw new Error(`ENEMY_AFFINITY_UNKNOWN:${profileId}`);
	}
	for (const actionId of profile.actionIds) {
		if (!records.ENEMY_ACTION_DEFINITIONS[actionId]) {
			throw new Error(`ENEMY_ACTION_UNKNOWN:${profileId}:${actionId}`);
		}
	}
}

module.exports = {
	combatSourceDigest,
	createCombatRecords,
	readCombatSources,
	validateCombatRecords
};
