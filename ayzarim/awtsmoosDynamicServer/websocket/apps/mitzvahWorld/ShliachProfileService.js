// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShliachProfileService.js
 * @description Owns private migration, allocation, affinity loadouts, powerups, and projection.
 * The Awtsmoos renews chosen vessels beneath earned points and lawful bounds;
 * Awtsmoos.com keeps owner-only growth authoritative while no public packet reveals its grounds.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { attributeDefinition } = require('./PlayerAttributeCatalog.js');
const { playerPowerupDefinition } = require('./PlayerPowerupCatalog.js');
const {
	ensureShliachState,
	projectShliachProfile,
	removeExpiredPowerups
} = require('./ShliachProfileProjection.js');
const { setShliachLoadout } = require('./ShliachProfileState.js');

class ShliachProfileService {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
	}

	snapshot(player) {
		return projectShliachProfile(player, this.clock());
	}

	allocate(player, attributeId, points = 1) {
		const state = ensureShliachState(player);
		const definition = attributeDefinition(attributeId);
		if (!definition) {
			throw new RealtimeError('ATTRIBUTE_NOT_FOUND', 'That Shliach attribute does not exist.');
		}
		const amount = requirePoints(points);
		if (state.unspentPoints < amount) {
			throw new RealtimeError('ATTRIBUTE_POINTS_UNAVAILABLE', 'Not enough attribute points remain.');
		}
		const current = Number(state.attributes[attributeId] || 0);
		if (current + amount > definition.maximum) {
			throw new RealtimeError('ATTRIBUTE_MAXIMUM', 'That attribute has reached its maximum.');
		}
		state.attributes[attributeId] = current + amount;
		state.unspentPoints -= amount;
		return this.snapshot(player);
	}

	loadout(player, affinityId, actionIds) {
		ensureShliachState(player);
		try {
			setShliachLoadout(player, affinityId, actionIds);
		} catch (error) {
			throw new RealtimeError(
				'AFFINITY_LOADOUT_REJECTED',
				error.message || 'The requested affinity loadout is invalid.'
			);
		}
		return this.snapshot(player);
	}

	activate(player, powerupId) {
		const state = ensureShliachState(player);
		removeExpiredPowerups(state, this.clock());
		const definition = playerPowerupDefinition(powerupId);
		if (!definition) {
			throw new RealtimeError('POWERUP_NOT_FOUND', 'That powerup does not exist.');
		}
		if (player.wallet.mitzvahCoins < definition.cost) {
			throw new RealtimeError('INSUFFICIENT_FUNDS', 'Not enough Perutas remain for that powerup.');
		}
		const now = this.clock();
		player.wallet.mitzvahCoins -= definition.cost;
		state.activePowerups[powerupId] = {
			activatedAt: now,
			expiresAt: now + definition.durationMs
		};
		return this.snapshot(player);
	}

	derived(player) {
		return this.snapshot(player).derived;
	}

	removeExpired(player) {
		removeExpiredPowerups(ensureShliachState(player), this.clock());
	}
}

function requirePoints(value) {
	const points = Number(value);
	if (!Number.isSafeInteger(points) || points < 1 || points > 5) {
		throw new RealtimeError(
			'INVALID_ATTRIBUTE_POINTS',
			'Attribute points must be an integer from one to five.'
		);
	}
	return points;
}

module.exports = { ShliachProfileService };
