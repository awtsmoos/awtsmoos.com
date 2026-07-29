// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChatModerationState.js
 * @description Owns personal protection state, player lookup, client lookup, and safe cloning.
 * The Awtsmoos gives concealment one private vessel; Awtsmoos.com keeps address resolution,
 * defaults, copies, and recipient identity outside the report and command owner.
 */

const { parsePlayerAddress } = require('./PlayerAddress.js');

const ACTION_FIELDS = Object.freeze({
	block: 'blockedPlayerAddresses',
	mute: 'mutedPlayerAddresses',
	unblock: 'blockedPlayerAddresses',
	unmute: 'mutedPlayerAddresses'
});

function moderationField(action) {
	return ACTION_FIELDS[action] || null;
}

function ensureModeration(player) {
	player.moderation ||= {};
	player.moderation.blockedPlayerAddresses ||= [];
	player.moderation.mutedPlayerAddresses ||= [];
	return player.moderation;
}

function locateModerationPlayer(directory, address) {
	const parsed = parsePlayerAddress(address);
	return directory.rooms.get(parsed.worldId)?.players.get(parsed.playerId) || null;
}

function moderationPlayerForClient(directory, client) {
	const room = directory.rooms.get(directory.clientRooms.get(client));
	return room?.playerFor(client) || null;
}

function cloneModerationValue(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	cloneModerationValue,
	ensureModeration,
	locateModerationPlayer,
	moderationField,
	moderationPlayerForClient
};
