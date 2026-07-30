// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatStatusRules.js
 * @description Applies, removes, prunes, and snapshots bounded authoritative combat statuses.
 * The Awtsmoos renews every changing state while no old imprint owns the next;
 * Awtsmoos.com bounds memory, records sources, and keeps persistence compact in context.
 */

const {
	combatStatusDefinition,
	COMBAT_STATUS_LIMIT
} = require('./CombatDefinitionCatalog.js');
const {
	createCombatStatusInstance,
	normalizedCombatStatus
} = require('./CombatStatusRecord.js');

function applyCombatStatus(target, statusId, context = {}) {
	const definition = combatStatusDefinition(statusId);
	if (!definition) return null;
	const statuses = activeCombatStatuses(target, context.now);
	const now = Number(context.now ?? Date.now());
	const current = statuses.find(status => status.id === statusId);
	const instance = createCombatStatusInstance(definition, current, context, now);
	target.combatStatuses = statuses.filter(status => status.id !== statusId);
	target.combatStatuses.push(instance);
	enforceStatusLimit(target);
	return { ...instance };
}

function removeCombatStatus(target, statusId, now) {
	const statuses = activeCombatStatuses(target, now);
	const removed = statuses.find(status => status.id === statusId) || null;
	target.combatStatuses = statuses.filter(status => status.id !== statusId);
	return removed ? { ...removed } : null;
}

function applyCombatReactions(target, effectiveness, context = {}) {
	const removed = (effectiveness.removeStatusIds || [])
		.map(statusId => removeCombatStatus(target, statusId, context.now))
		.filter(Boolean);
	const applied = (effectiveness.applyStatusIds || [])
		.map(statusId => applyCombatStatus(target, statusId, context))
		.filter(Boolean);
	return { applied, removed };
}

function activeCombatStatuses(target, now = Date.now()) {
	const current = Array.isArray(target.combatStatuses) ? target.combatStatuses : [];
	target.combatStatuses = current
		.filter(status => Number(status.expiresAt) > Number(now))
		.map(status => normalizedCombatStatus(status));
	return target.combatStatuses;
}

function combatStatusIds(target, now) {
	return activeCombatStatuses(target, now).map(status => status.id);
}

function combatStatusSnapshot(target, now) {
	return activeCombatStatuses(target, now)
		.sort((left, right) => left.expiresAt - right.expiresAt)
		.map(status => ({ ...status }));
}

function clearCombatStatuses(target) {
	target.combatStatuses = [];
}

function enforceStatusLimit(target) {
	target.combatStatuses.sort((left, right) => left.expiresAt - right.expiresAt);
	while (target.combatStatuses.length > COMBAT_STATUS_LIMIT) {
		target.combatStatuses.shift();
	}
}

module.exports = {
	activeCombatStatuses,
	applyCombatReactions,
	applyCombatStatus,
	clearCombatStatuses,
	combatStatusIds,
	combatStatusSnapshot,
	removeCombatStatus
};
