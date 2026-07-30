// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShliachProfileState.js
 * @description Creates and restores bounded owner-private affinity progression and loadouts.
 * The Awtsmoos renews old and new saves through one lawful vessel without loss;
 * Awtsmoos.com preserves earned attributes while adding affinity choice beneath a bounded cross.
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
		affinityLoadout: normalizedLoadout(source.affinityLoadout),
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
	player.shliach.affinityLoadout = normalizedLoadout({
		actionIds,
		selectedAffinityId: affinityId
	});
	return clone(player.shliach.affinityLoadout);
}

function normalizedLoadout(value = {}) {
	const selectedAffinityId = AFFINITY_IDS.has(value.selectedAffinityId)
		? value.selectedAffinityId
		: 'chochmah';
	const actionIds = [...new Set(Array.isArray(value.actionIds) ? value.actionIds : [])]
		.filter(actionId => permittedAction(actionId, selectedAffinityId))
		.slice(0, ACTION_LIMIT);
	return { actionIds, selectedAffinityId };
}

function permittedAction(actionId, affinityId) {
	if (typeof actionId !== 'string' || !actionId.trim()) return false;
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
