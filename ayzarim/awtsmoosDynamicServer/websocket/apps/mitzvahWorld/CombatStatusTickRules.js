// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatStatusTickRules.js
 * @description Advances persisted periodic status cursors with bounded reconnect catch-up.
 * The Awtsmoos renews each instant without allowing missed time to become an endless flame;
 * Awtsmoos.com caps catch-up, advances one cursor, and records each lawful tick by name.
 */

const { combatStatusDefinition } = require('./CombatDefinitionCatalog.js');
const { activeCombatStatuses } = require('./CombatStatusRules.js');

const MAXIMUM_CATCH_UP_TICKS = 4;

function tickCombatStatuses(target, now = Date.now()) {
	const events = [];
	for (const status of activeCombatStatuses(target, now)) {
		const definition = combatStatusDefinition(status.id);
		const event = tickStatus(status, definition, now);
		if (event) events.push(event);
	}
	return events;
}

function tickStatus(status, definition, now) {
	const tickMs = Math.max(0, Number(definition?.tickMs || 0));
	if (!tickMs || Number(status.nextTickAt || 0) > Number(now)) return null;
	const finalTickAt = Math.min(Number(now), Number(status.expiresAt));
	const dueTicks = Math.floor(
		(finalTickAt - Number(status.nextTickAt || finalTickAt)) / tickMs
	) + 1;
	const ticks = Math.max(1, Math.min(MAXIMUM_CATCH_UP_TICKS, dueTicks));
	status.nextTickAt = Number(status.nextTickAt || now) + tickMs * ticks;
	const damagePerTick = Number(definition.modifiers?.damagePerTick || 0);
	return Object.freeze({
		damage: Math.max(0, damagePerTick * Number(status.stacks || 1) * ticks),
		id: status.id,
		sourceActionId: status.sourceActionId,
		sourceActorId: status.sourceActorId,
		ticks
	});
}

module.exports = {
	MAXIMUM_CATCH_UP_TICKS,
	tickCombatStatuses
};
