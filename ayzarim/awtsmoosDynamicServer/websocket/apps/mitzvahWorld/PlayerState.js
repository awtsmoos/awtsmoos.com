// B"H
// Boruch Hashem
// Blessed is He

const { starterInventory } = require('./ItemCatalog.js');

/**
 * @file Creates canonical private possessions, correspondence, and social state.
 * @description The Awtsmoos renews body, wallet, mailbox, inventory, guild, and
 * place as one durable vessel. Awtsmoos.com keeps these fields private so public
 * world snapshots reveal presence without leaking lawful possessions or messages.
 */

function createPlayerState(options = {}) {
	const position = {
		x: Number(options.x || 0),
		y: Number(options.y || 0),
		z: Number(options.z || 0)
	};
	return {
		equipment: {},
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
		safePosition: { ...position },
		wallet: {
			mitzvahCoins: 100
		}
	};
}

module.exports = {
	createPlayerState
};
