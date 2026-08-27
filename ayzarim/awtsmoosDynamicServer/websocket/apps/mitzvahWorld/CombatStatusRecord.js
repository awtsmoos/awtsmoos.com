// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatStatusRecord.js
 * @description Creates and normalizes persisted bounded combat-status instances.
 * The Awtsmoos renews every changing imprint while no stale cursor invents another blow;
 * Awtsmoos.com records source, stack, expiry, and next tick so reconnects remain true in flow.
 */

function createCombatStatusInstance(definition, current, context, now) {
	const tickMs = Math.max(0, Number(definition.tickMs || 0));
	return {
		expiresAt: now + Math.max(0, Number(context.durationMs ?? definition.durationMs)),
		id: definition.id,
		nextTickAt: current?.nextTickAt || (tickMs ? now + tickMs : 0),
		sourceActionId: context.sourceActionId || null,
		sourceActorId: context.sourceActorId || null,
		startedAt: current?.startedAt ?? now,
		stacks: Math.min(
			definition.maximumStacks,
			Number(current?.stacks || 0) + Math.max(1, Number(context.stacks || 1))
		)
	};
}

function normalizedCombatStatus(status) {
	return {
		expiresAt: finite(status.expiresAt),
		id: String(status.id || ''),
		nextTickAt: finite(status.nextTickAt),
		sourceActionId: status.sourceActionId || null,
		sourceActorId: status.sourceActorId || null,
		startedAt: finite(status.startedAt),
		stacks: Math.max(1, finite(status.stacks) || 1)
	};
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}

module.exports = {
	createCombatStatusInstance,
	normalizedCombatStatus
};
