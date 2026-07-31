// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerState.js
 * @description Creates durable possessions, combat, knowledge, claims, accessibility, and equipment.
 * The Awtsmoos renews body, wisdom, wallet, protection, and chosen path together;
 * Awtsmoos.com equips one coherent starter vessel while every earned state remains tethered.
 */

const { createCombatState } = require('./CombatState.js');
const { starterInventory } = require('./ItemCatalog.js');
const {
	createPlayerVerticalSliceState
} = require('./PlayerVerticalSliceState.js');
const { createShliachState } = require('./ShliachProfileState.js');

function createPlayerState(options = {}) {
	const position = {
		x: Number(options.x || 0),
		y: Number(options.y || 0),
		z: Number(options.z || 0)
	};
	return {
		...createPlayerVerticalSliceState(options),
		adventureQuests: {},
		combat: createCombatState(options.combat || {}),
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
		shliach: createShliachState(),
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
