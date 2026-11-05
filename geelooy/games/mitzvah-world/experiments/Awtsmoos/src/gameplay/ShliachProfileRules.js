// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShliachProfileRules.js
 * @description Applies allocation, loadout, reward, synchronization, powerup, and expiry laws.
 * The Awtsmoos renews each earned choice while bounded rules protect every spark;
 * Awtsmoos.com lets migration and progression meet without erasing an earlier mark.
 */

import {
	SHLIACH_ATTRIBUTES,
	SHLIACH_POWERUPS
} from './ShliachProfileCatalog.js';
import {
	PROFILE_KEYS,
	knownAffinityId,
	normalizedAffinityLoadout,
	normalizedShliachProfile
} from './ShliachProfileNormalization.js';

const BASE_LEVEL_XP = 200;
const LEVEL_XP_GROWTH = 1.35;

export function createShliachProfileState(overrides = {}) {
	return normalizedShliachProfile(overrides);
}

export function allocateShliachAttribute(state, attributeId, points) {
	const definition = SHLIACH_ATTRIBUTES[attributeId];
	if (!definition) throw new Error('ATTRIBUTE_NOT_FOUND');
	if (!Number.isInteger(points) || points < 1 || points > 5) {
		throw new Error('INVALID_ATTRIBUTE_POINTS');
	}
	if (state.unspentPoints < points) throw new Error('ATTRIBUTE_POINTS_UNAVAILABLE');
	const current = Number(state.attributes[attributeId] || 0);
	if (current + points > definition.maximum) throw new Error('ATTRIBUTE_MAXIMUM');
	state.attributes[attributeId] = current + points;
	state.unspentPoints -= points;
}

export function setAffinityLoadout(state, selectedAffinityId, actionIds = []) {
	if (!knownAffinityId(selectedAffinityId)) throw new Error('AFFINITY_NOT_FOUND');
	state.affinityLoadout = normalizedAffinityLoadout({ actionIds, selectedAffinityId });
	return structuredClone(state.affinityLoadout);
}

export function awardShlichusProgress(state, reward = {}) {
	state.xp += nonNegativeInteger(reward.xp);
	state.mitzvahPoints += nonNegativeInteger(reward.mitzvahPoints);
	let levelsGained = 0;
	while (state.xp >= xpForNextLevel(state.level)) {
		state.xp -= xpForNextLevel(state.level);
		state.level += 1;
		state.unspentPoints += 2;
		levelsGained += 1;
	}
	return levelsGained;
}

export function xpForNextLevel(level) {
	return Math.round(
		BASE_LEVEL_XP * Math.pow(LEVEL_XP_GROWTH, Math.max(0, Number(level) - 1))
	);
}

export function activateShliachPowerup(state, inventory, powerupId, now) {
	const definition = SHLIACH_POWERUPS[powerupId];
	if (!definition) throw new Error('POWERUP_NOT_FOUND');
	if (state.perutas != null) spendWallet(state, definition.cost);
	else spendInventory(inventory, definition.cost);
	state.activePowerups[powerupId] = {
		activatedAt: Number(now),
		expiresAt: Number(now) + definition.durationMs
	};
}

export function synchronizeShliachProfile(state, payload) {
	const migrated = normalizedShliachProfile(payload?.shliach || payload || {});
	for (const key of PROFILE_KEYS) state[key] = structuredClone(migrated[key]);
}

export function removeExpiredShliachPowerups(state, now) {
	for (const [powerupId, powerup] of Object.entries(state.activePowerups)) {
		if (Number(powerup.expiresAt) <= Number(now)) delete state.activePowerups[powerupId];
	}
}

function spendWallet(state, cost) {
	if (state.perutas < cost) throw new Error('INSUFFICIENT_FUNDS');
	state.perutas -= cost;
}

function spendInventory(inventory, cost) {
	if (!inventory) throw new Error('PERUTA_WALLET_UNAVAILABLE');
	inventory.remove('perutas', cost);
}

function nonNegativeInteger(value) {
	return Math.max(0, Math.trunc(Number(value) || 0));
}
