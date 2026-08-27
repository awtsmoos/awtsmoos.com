// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerAddress.js
 * @description Creates and resolves globally unambiguous public player addresses.
 * The Awtsmoos renews one local entity inside one world; Awtsmoos.com joins world
 * and entity identifiers only for discovery and communication, never persistence keys.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');

function playerAddress(worldId, playerId) {
	return `${worldId}:${playerId}`;
}

function normalizePlayerAddress(roomId, addressOrPlayerId) {
	const value = String(addressOrPlayerId || '');
	return value.includes(':') ? value : playerAddress(roomId, value);
}

function parsePlayerAddress(address) {
	const value = String(address || '');
	const separator = value.lastIndexOf(':');
	if (separator < 1 || separator === value.length - 1) {
		throw new RealtimeError(
			'CHAT_PRIVATE_TARGET_INVALID',
			'Choose a connected player address.'
		);
	}
	return {
		playerId: value.slice(separator + 1),
		worldId: value.slice(0, separator)
	};
}

module.exports = {
	normalizePlayerAddress,
	parsePlayerAddress,
	playerAddress
};
