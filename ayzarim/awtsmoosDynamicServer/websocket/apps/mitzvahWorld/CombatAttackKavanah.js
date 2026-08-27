// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatAttackKavanah.js
 * @description Requires, projects, consumes, and converts deliberate release into control duration.
 * The Awtsmoos lets intention strengthen clarity without becoming another damage multiplier;
 * Awtsmoos.com rejects stale or reused releases while status duration receives bounded purpose.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const {
	combatStatusDefinition
} = require('./CombatDefinitionCatalog.js');

function requireAttackKavanah(player, action) {
	if (action.id !== 'letter-light') return null;
	const state = player.combat.kavanah;
	if (!state
		|| state.actionId !== action.id
		|| !state.released
		|| !state.result
		|| state.consumedAt) {
		throw new RealtimeError(
			'KAVANAH_RELEASE_REQUIRED',
			'Letter Light requires one unconsumed server-timed Kavanah release.'
		);
	}
	return Object.freeze({
		castId: state.castId,
		controlMultiplier: Number(state.result.controlMultiplier || 1),
		releaseWindow: state.result.releaseWindow,
		statusStrengthMultiplier: Number(
			state.result.statusStrengthMultiplier || 1
		),
		tier: state.result.tier,
		vulnerable: Boolean(state.result.vulnerable)
	});
}

function consumeAttackKavanah(player, kavanah, now = Date.now()) {
	if (!kavanah) return null;
	const state = player.combat.kavanah;
	if (!state || state.castId !== kavanah.castId || state.consumedAt) {
		throw new RealtimeError(
			'STALE_KAVANAH_RELEASE',
			'The deliberate release was already consumed or replaced.'
		);
	}
	state.consumedAt = Number(now);
	return Object.freeze({ ...kavanah, consumedAt: state.consumedAt });
}

function kavanahStatusDuration(statusIds, kavanah) {
	if (!kavanah || !Array.isArray(statusIds) || !statusIds.length) return null;
	const durations = statusIds
		.map(statusId => combatStatusDefinition(statusId)?.durationMs)
		.filter(value => Number.isFinite(Number(value)));
	if (!durations.length) return null;
	const base = Math.max(...durations);
	return Math.round(
		base * Math.max(
			0.75,
			Math.min(1.5, Number(kavanah.statusStrengthMultiplier || 1))
		)
	);
}

module.exports = {
	consumeAttackKavanah,
	kavanahStatusDuration,
	requireAttackKavanah
};
