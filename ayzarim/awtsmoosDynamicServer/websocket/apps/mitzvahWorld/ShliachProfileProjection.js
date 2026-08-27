// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShliachProfileProjection.js
 * @description Migrates owner state, applies active powerups, and creates one private profile view.
 * The Awtsmoos renews hidden growth beneath one lawful mirror and measured sign;
 * Awtsmoos.com keeps migration, timed effects, progression, and derived truth aligned.
 */

const {
	ATTRIBUTE_CATALOG,
	derivedPlayerStats
} = require('./PlayerAttributeCatalog.js');
const { PLAYER_POWERUPS, playerPowerupDefinition } = require('./PlayerPowerupCatalog.js');
const { restoreShliachState } = require('./ShliachProfileState.js');

function ensureShliachState(player) {
	player.progression ||= { level: 1, mitzvahPoints: 0, xp: 0 };
	player.shliach = restoreShliachState(player.shliach, player.progression);
	return player.shliach;
}

function projectShliachProfile(player, now = Date.now()) {
	const state = ensureShliachState(player);
	removeExpiredPowerups(state, now);
	return clone({
		activePowerups: state.activePowerups,
		affinityLoadout: state.affinityLoadout,
		attributes: state.attributes,
		catalog: ATTRIBUTE_CATALOG,
		derived: applyActivePowerups(derivedPlayerStats(player), state.activePowerups),
		level: Number(player.progression.level || 1),
		mitzvahPoints: Number(player.progression.mitzvahPoints || state.mitzvahPoints || 0),
		perutas: Number(player.wallet?.mitzvahCoins || 0),
		powerups: PLAYER_POWERUPS,
		schemaVersion: state.schemaVersion,
		unspentPoints: state.unspentPoints,
		xp: Number(player.progression.xp || state.xp || 0)
	});
}

function applyActivePowerups(derived, activePowerups) {
	const result = clone(derived);
	for (const powerupId of Object.keys(activePowerups || {})) {
		const effect = playerPowerupDefinition(powerupId)?.effect || {};
		if (effect.focusBonus) result.focusMaximum += effect.focusBonus;
		if (effect.damageBonus) result.damageBonus += effect.damageBonus;
		if (effect.armorBonus) result.armor += effect.armorBonus;
		if (effect.trackingBonus) result.trackingRange += effect.trackingBonus;
		if (effect.cooldownMultiplier) {
			result.cooldownMultiplier *= effect.cooldownMultiplier;
		}
	}
	return result;
}

function removeExpiredPowerups(state, now) {
	for (const [powerupId, powerup] of Object.entries(state.activePowerups || {})) {
		if (Number(powerup.expiresAt) <= Number(now)) delete state.activePowerups[powerupId];
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	ensureShliachState,
	projectShliachProfile,
	removeExpiredPowerups
};
