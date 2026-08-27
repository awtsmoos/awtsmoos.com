// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatCooldownRuntime.js
 * @description Calculates, publishes, and inspects combat cooldown truth.
 * The Awtsmoos creates readiness and restraint together; Awtsmoos.com keeps repeated
 * publications bounded while browser and simulation share identical measured clocks.
 */

export function minimalCombatCooldownRemaining(combat, actionId) {
	return Math.max(
		0,
		(combat.cooldowns.get(actionId) || 0) - combat.clock
	);
}

export function publishMinimalCombatCooldowns(combat, actions, force = false) {
	const cooldowns = {};
	for (const actionId of Object.keys(actions)) {
		cooldowns[actionId] = Number(
			minimalCombatCooldownRemaining(combat, actionId).toFixed(2)
		);
	}
	const signature = JSON.stringify(cooldowns);
	if (!force && signature === combat.lastCooldownSignature) {
		return;
	}
	combat.lastCooldownSignature = signature;
	combat.runtime.bus.emit('combat:cooldowns', {
		actions: cooldowns,
		clock: combat.clock
	});
}

export function minimalCombatDiagnostics(combat, actions) {
	return {
		casting: combat.cast?.actionId || null,
		cooldowns: Object.fromEntries(
			Object.keys(actions).map(actionId => [
				actionId,
				minimalCombatCooldownRemaining(combat, actionId)
			])
		),
		effects: combat.effects.length,
		progress: combat.cast?.progress || 0,
		projectiles: combat.projectiles.length
	};
}
