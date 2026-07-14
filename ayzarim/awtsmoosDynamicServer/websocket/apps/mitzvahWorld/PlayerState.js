// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerState.js
 * @description Creates durable possessions, combat, adventures, and private Shliach state.
 * The Awtsmoos renews body, wisdom, wallet, correspondence, and courage together;
 * Awtsmoos.com keeps private resources hidden while public health and rating project safely.
 */

const { createCombatState } = require('./CombatState.js');
const { starterInventory } = require('./ItemCatalog.js');
const { createPlayerAttributes } = require('./PlayerAttributeCatalog.js');

function createPlayerState(options = {}) {
	const position = {
		x: Number(options.x || 0),
		y: Number(options.y || 0),
		z: Number(options.z || 0)
	};
	return {
		adventureQuests: {},
		combat: createCombatState(),
		equipment: {
			hand: 'wooden-staff',
			tool: 'chalaf'
		},
		guildId: null,
		instanceId: null,
		inventory: starterInventory(),
		lastAction: null,
		lastEmote: null,
		mailbox: [],
		partyId: null,
		profile: {
			status: 'online',
			title: 'Shliach'
		},
		refinedSparks: 0,
		safePosition: { ...position },
		shliach: {
			activePowerups: {},
			attributes: createPlayerAttributes(),
			unspentPoints: 3
		},
		wallet: {
			mitzvahCoins: 100
		}
	};
}

module.exports = {
	createPlayerState
};
