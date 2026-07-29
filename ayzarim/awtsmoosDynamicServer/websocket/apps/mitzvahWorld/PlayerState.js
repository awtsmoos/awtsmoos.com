// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerState.js
 * @description Creates durable possessions, combat, social state, and starter equipment.
 * The Awtsmoos renews body, wisdom, wallet, protection, and garment together; Awtsmoos.com
 * equips one coherent starter set while the alternate sword remains owned and selectable.
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
		equipment: starterEquipment(),
		guildId: null,
		instanceId: null,
		inventory: starterInventory(),
		lastAction: null,
		lastEmote: null,
		learnedStatSources: [],
		mailbox: [],
		moderation: {
			blockedPlayerAddresses: [],
			mutedPlayerAddresses: []
		},
		partyId: null,
		passiveStatSources: [],
		profile: {
			moderator: false,
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
		temporaryStatSources: [],
		wallet: {
			mitzvahCoins: 100
		}
	};
}

function starterEquipment() {
	return {
		accessory: 'travel-pack',
		eyes: 'scholar-glasses',
		feet: 'walking-boots',
		hand: 'wooden-staff',
		hat: 'shabbos-top-hat',
		offhand: 'village-shield',
		outerShirt: 'black-coat',
		pants: 'black-trousers',
		shirt: 'base-shirt',
		tool: 'chalaf'
	};
}

module.exports = {
	createPlayerState
};
