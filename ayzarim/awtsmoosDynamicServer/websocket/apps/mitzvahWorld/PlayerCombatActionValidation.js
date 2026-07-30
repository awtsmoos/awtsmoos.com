// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerCombatActionValidation.js
 * @description Rejects forged actions, unavailable unlocks, windows, weapons, and replayed impacts.
 * The Awtsmoos distinguishes intention from consequence while no old token may return;
 * Awtsmoos.com keeps a bounded memory of resolved impacts so authority remains firm and clear.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { actionUnlocked, derivedCombatAction } = require('./CombatDerivedActionRules.js');
const { playerCombatAction } = require('./PlayerCombatActionCatalog.js');

const IMPACT_LEDGER_LIMIT = 64;
const IMPACT_LEDGER_RETENTION_MS = 120000;

function requirePlayerCombatAction(player, command, weapon, now = Date.now()) {
	const definition = playerCombatAction(command.actionId);
	if (!definition) throw failure('UNKNOWN_COMBAT_ACTION', 'The requested combat action is unknown.');
	if (command.weaponId !== definition.weaponId) {
		throw failure('ACTION_WEAPON_MISMATCH', 'The combat action does not match the requested weapon.');
	}
	if (!actionUnlocked(player, definition)) {
		throw failure('ACTION_NOT_UNLOCKED', 'The equipped and learned sources do not unlock this action.');
	}
	const action = derivedCombatAction(player, definition, weapon, command.elapsedSeconds);
	const elapsed = Number(command.elapsedSeconds);
	if (!Number.isFinite(elapsed) || elapsed < action.activeStart || elapsed > action.activeEnd) {
		throw failure('ACTION_WINDOW_REJECTED', 'The combat action is outside its derived active hit window.');
	}
	const token = normalizedImpactToken(command.impactToken);
	if (!token) throw failure('COMBAT_IMPACT_TOKEN_REQUIRED', 'A combat impact token is required.');
	if (recentImpactLedger(player, now).some(entry => entry.token === token)) {
		throw failure('DUPLICATE_COMBAT_IMPACT', 'This combat impact was already resolved.');
	}
	return action;
}

function rememberCombatImpact(player, impactToken, now = Date.now()) {
	const token = normalizedImpactToken(impactToken);
	if (!token) return;
	const ledger = recentImpactLedger(player, now);
	ledger.push({ at: Number(now), token });
	player.combat.recentImpactTokens = ledger.slice(-IMPACT_LEDGER_LIMIT);
	player.combat.lastImpactToken = token;
}

function recentImpactLedger(player, now = Date.now()) {
	const combat = player.combat || (player.combat = {});
	const minimumAt = Number(now) - IMPACT_LEDGER_RETENTION_MS;
	const source = Array.isArray(combat.recentImpactTokens)
		? combat.recentImpactTokens
		: legacyImpactEntries(combat);
	combat.recentImpactTokens = source
		.map(normalizedImpactEntry)
		.filter(entry => entry.token && entry.at >= minimumAt)
		.slice(-IMPACT_LEDGER_LIMIT);
	return combat.recentImpactTokens;
}

function legacyImpactEntries(combat) {
	return combat.lastImpactToken
		? [{ at: Date.now(), token: combat.lastImpactToken }]
		: [];
}

function normalizedImpactEntry(entry = {}) {
	return {
		at: Number.isFinite(Number(entry.at)) ? Number(entry.at) : 0,
		token: normalizedImpactToken(entry.token)
	};
}

function normalizedImpactToken(value) {
	return typeof value === 'string' ? value.trim().slice(0, 160) : '';
}

function failure(code, message) {
	return new RealtimeError(code, message);
}

module.exports = {
	IMPACT_LEDGER_LIMIT,
	IMPACT_LEDGER_RETENTION_MS,
	rememberCombatImpact,
	requirePlayerCombatAction
};
