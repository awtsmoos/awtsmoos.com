// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShliachProfileService.js
 * @description Allocates attributes, activates timed powerups, and projects private stats.
 * The Awtsmoos renews every strengthening beneath choice and boundary; Awtsmoos.com
 * keeps points, Perutas, expiry, and derived effects authoritative and owner-private.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const {
	ATTRIBUTE_CATALOG,
	attributeDefinition,
	derivedPlayerStats
} = require('./PlayerAttributeCatalog.js');
const {
	PLAYER_POWERUPS,
	playerPowerupDefinition
} = require('./PlayerPowerupCatalog.js');

class ShliachProfileService {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
	}

	snapshot(player) {
		this.removeExpired(player);
		return clone({
			activePowerups: player.shliach.activePowerups,
			attributes: player.shliach.attributes,
			catalog: ATTRIBUTE_CATALOG,
			derived: this.derived(player),
			level: player.progression.level,
			mitzvahPoints: player.progression.mitzvahPoints,
			perutas: player.wallet.mitzvahCoins,
			powerups: PLAYER_POWERUPS,
			unspentPoints: player.shliach.unspentPoints,
			xp: player.progression.xp
		});
	}

	allocate(player, attributeId, points = 1) {
		const definition = attributeDefinition(attributeId);
		if (!definition) throw new RealtimeError('ATTRIBUTE_NOT_FOUND', 'That Shliach attribute does not exist.');
		const amount = requirePoints(points);
		if (player.shliach.unspentPoints < amount) {
			throw new RealtimeError('ATTRIBUTE_POINTS_UNAVAILABLE', 'Not enough attribute points remain.');
		}
		const current = player.shliach.attributes[attributeId];
		if (current + amount > definition.maximum) {
			throw new RealtimeError('ATTRIBUTE_MAXIMUM', 'That attribute has reached its maximum.');
		}
		player.shliach.attributes[attributeId] += amount;
		player.shliach.unspentPoints -= amount;
		return this.snapshot(player);
	}

	activate(player, powerupId) {
		const definition = playerPowerupDefinition(powerupId);
		if (!definition) throw new RealtimeError('POWERUP_NOT_FOUND', 'That powerup does not exist.');
		if (player.wallet.mitzvahCoins < definition.cost) {
			throw new RealtimeError('INSUFFICIENT_FUNDS', 'Not enough Perutas remain for that powerup.');
		}
		const now = this.clock();
		player.wallet.mitzvahCoins -= definition.cost;
		player.shliach.activePowerups[powerupId] = {
			activatedAt: now,
			expiresAt: now + definition.durationMs
		};
		return this.snapshot(player);
	}

	derived(player) {
		const derived = derivedPlayerStats(player);
		for (const powerupId of Object.keys(player.shliach.activePowerups)) {
			const effect = playerPowerupDefinition(powerupId)?.effect || {};
			if (effect.focusBonus) derived.focusMaximum += effect.focusBonus;
			if (effect.damageBonus) derived.damageBonus += effect.damageBonus;
			if (effect.armorBonus) derived.armor += effect.armorBonus;
			if (effect.trackingBonus) derived.trackingRange += effect.trackingBonus;
			if (effect.cooldownMultiplier) {
				derived.cooldownMultiplier *= effect.cooldownMultiplier;
			}
		}
		return derived;
	}

	removeExpired(player) {
		const now = this.clock();
		for (const [powerupId, state] of Object.entries(player.shliach.activePowerups)) {
			if (state.expiresAt <= now) delete player.shliach.activePowerups[powerupId];
		}
	}
}

function requirePoints(value) {
	const points = Number(value);
	if (!Number.isSafeInteger(points) || points < 1 || points > 5) {
		throw new RealtimeError('INVALID_ATTRIBUTE_POINTS', 'Attribute points must be an integer from one to five.');
	}
	return points;
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	ShliachProfileService
};
