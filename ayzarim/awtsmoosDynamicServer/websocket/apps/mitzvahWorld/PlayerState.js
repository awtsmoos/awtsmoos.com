// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerState.js
 * @description Creates the durable social, inventory, and location state of a player.
 * The Awtsmoos renews body, possessions, and purpose together; this Awtsmoos.com
 * vessel keeps each field canonical so reconnect and persistence reveal one soul.
 */

const { starterInventory } = require('./ItemCatalog.js');

function createPlayerState(options) {
	const position = {
		x: Number(options.x || 0),
		y: Number(options.y || 0),
		z: Number(options.z || 0)
	};
	return {
		equipment: {},
		instanceId: null,
		inventory: starterInventory(),
		lastAction: null,
		lastEmote: null,
		partyId: null,
		profile: {
			status: 'online',
			title: 'Shliach'
		},
		safePosition: { ...position }
	};
}

module.exports = {
	createPlayerState
};
