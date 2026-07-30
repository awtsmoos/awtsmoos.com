// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatCooldownRules.js
 * @description Maintains bounded authoritative support-cast cooldown readiness.
 * The Awtsmoos renews every present chance while expired restraint falls away;
 * Awtsmoos.com bounds cooldown memory so old casts cannot crowd tomorrow's day.
 */

const COOLDOWN_LIMIT = 32;

function requireCombatCooldownReady(combat, actionId, now = Date.now()) {
	const cooldowns = activeCombatCooldowns(combat, now);
	const readyAt = Number(cooldowns[actionId] || 0);
	if (readyAt > Number(now)) {
		const error = new Error('COMBAT_CAST_COOLDOWN');
		error.readyAt = readyAt;
		throw error;
	}
	return true;
}

function rememberCombatCooldown(combat, actionId, cooldownMs, now = Date.now()) {
	const cooldowns = activeCombatCooldowns(combat, now);
	cooldowns[actionId] = Number(now) + Math.max(0, Number(cooldownMs || 0));
	combat.supportCooldowns = boundedCooldowns(cooldowns);
	return combat.supportCooldowns[actionId];
}

function activeCombatCooldowns(combat, now = Date.now()) {
	const source = combat.supportCooldowns && typeof combat.supportCooldowns === 'object'
		? combat.supportCooldowns
		: {};
	combat.supportCooldowns = Object.fromEntries(
		Object.entries(source)
			.filter(([, readyAt]) => Number(readyAt) > Number(now))
			.map(([actionId, readyAt]) => [actionId, Number(readyAt)])
	);
	return combat.supportCooldowns;
}

function boundedCooldowns(cooldowns) {
	return Object.fromEntries(
		Object.entries(cooldowns)
			.sort((left, right) => left[1] - right[1])
			.slice(-COOLDOWN_LIMIT)
	);
}

module.exports = {
	COOLDOWN_LIMIT,
	activeCombatCooldowns,
	rememberCombatCooldown,
	requireCombatCooldownReady
};
