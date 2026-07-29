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

function applyCombatStatus(target, statusId, context = {}) {
	const definition = combatStatusDefinition(statusId);
	if (!definition) return null;
	const statuses = activeCombatStatuses(target, context.now);
	const now = Number(context.now ?? Date.now());
	const current = statuses.find(status => status.id === statusId);
	const stacks = Math.min(
		definition.maximumStacks,
		Number(current?.stacks || 0) + Math.max(1, Number(context.stacks || 1))
	);
	const instance = {
		expiresAt: now + Math.max(0, Number(context.durationMs ?? definition.durationMs)),
		id: statusId,
		sourceActionId: context.sourceActionId || null,
		sourceActorId: context.sourceActorId || null,
		startedAt: current?.startedAt ?? now,
		stacks
	};
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
		.map(status => normalizedStatus(status));
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

function normalizedStatus(status) {
	return {
		expiresAt: Number(status.expiresAt || 0),
		id: String(status.id || ''),
		sourceActionId: status.sourceActionId || null,
		sourceActorId: status.sourceActorId || null,
		startedAt: Number(status.startedAt || 0),
		stacks: Math.max(1, Number(status.stacks || 1))
	};
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
