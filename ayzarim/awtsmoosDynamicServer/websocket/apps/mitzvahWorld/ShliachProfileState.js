// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShliachProfileState.js
 * @description Creates, restores, and strictly updates bounded private affinity progression.
 * The Awtsmoos renews old saves with mercy while live commands meet exact judgment;
 * Awtsmoos.com preserves earned attributes yet rejects false affinity and action arrangement.
 */

const { createPlayerAttributes } = require('./PlayerAttributeCatalog.js');
const { playerCombatDefinition } = require('./CombatDefinitionCatalog.js');

const PROFILE_SCHEMA_VERSION = 2;
const ACTION_LIMIT = 8;
const AFFINITY_IDS = new Set([
	'binah',
	'chochmah',
	'malchus',
	'zeir-anpin'
]);

function createShliachState(source = {}) {
	return {
		activePowerups: objectClone(source.activePowerups),
		affinityLoadout: restoredLoadout(source.affinityLoadout),
		attributes: createPlayerAttributes(source.attributes),
		mitzvahPoints: nonNegative(source.mitzvahPoints),
		schemaVersion: PROFILE_SCHEMA_VERSION,
		unspentPoints: nonNegative(source.unspentPoints ?? 3),
		xp: nonNegative(source.xp)
	};
}

function restoreShliachState(record, progression = {}) {
	const state = createShliachState(record || {});
	state.mitzvahPoints = nonNegative(record?.mitzvahPoints ?? progression.mitzvahPoints);
	state.xp = nonNegative(record?.xp ?? progression.xp);
	return state;
}

function setShliachLoadout(player, affinityId, actionIds) {
	if (!AFFINITY_IDS.has(affinityId)) throw new Error('AFFINITY_NOT_FOUND');
	if (!Array.isArray(actionIds) || actionIds.length > ACTION_LIMIT) {
		throw new Error('AFFINITY_LOADOUT_LIMIT');
	}
	const uniqueActionIds = [...new Set(actionIds)];
	for (const actionId of uniqueActionIds) requireAffinityAction(actionId, affinityId);
	player.shliach.affinityLoadout = {
		actionIds: uniqueActionIds,
		selectedAffinityId: affinityId
	};
	return clone(player.shliach.affinityLoadout);
}

function restoredLoadout(value = {}) {
	const selectedAffinityId = AFFINITY_IDS.has(value.selectedAffinityId)
		? value.selectedAffinityId
		: 'chochmah';
	const actionIds = [...new Set(Array.isArray(value.actionIds) ? value.actionIds : [])]
		.filter(actionId => affinityAction(actionId, selectedAffinityId))
		.slice(0, ACTION_LIMIT);
	return { actionIds, selectedAffinityId };
}

function requireAffinityAction(actionId, affinityId) {
	const action = playerCombatDefinition(actionId);
	if (!action) throw new Error(`COMBAT_ACTION_NOT_FOUND:${actionId}`);
	if (action.affinityId !== affinityId) {
		throw new Error(`ACTION_AFFINITY_MISMATCH:${actionId}:${affinityId}`);
	}
}

function affinityAction(actionId, affinityId) {
	const action = playerCombatDefinition(actionId);
	return Boolean(action && action.affinityId === affinityId);
}

function objectClone(value) {
	return value && typeof value === 'object' ? clone(value) : {};
}

function nonNegative(value) {
	return Math.max(0, Math.trunc(Number(value) || 0));
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	PROFILE_SCHEMA_VERSION,
	createShliachState,
	restoreShliachState,
	setShliachLoadout
};
