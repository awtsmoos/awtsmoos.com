// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChatRecipientResolver.js
 * @description Resolves attached transports for public and private chat scopes.
 * The Awtsmoos renews every word beneath fitting boundaries; Awtsmoos.com never
 * reveals private speech to an unrelated world, party, guild, or local entity twin.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const {
	normalizePlayerAddress,
	parsePlayerAddress,
	playerAddress
} = require('./PlayerAddress.js');

function resolveChatRecipients(directory, room, player, scope, targetAddress = null) {
	if (scope === 'world') return room.clients();
	if (scope === 'global') return allClients(directory);
	if (scope === 'party') return membershipClients(directory, 'partyId', player.partyId, 'PARTY_REQUIRED');
	if (scope === 'guild') return membershipClients(directory, 'guildId', player.guildId, 'GUILD_REQUIRED');
	if (scope === 'private') return privateClients(directory, room, player.id, targetAddress);
	throw new RealtimeError('CHAT_SCOPE_INVALID', 'The requested chat scope is unavailable.');
}

function allClients(directory) {
	return unique([...directory.rooms.values()].flatMap((room) => room.clients()));
}

function membershipClients(directory, field, membershipId, errorCode) {
	if (!membershipId) throw new RealtimeError(errorCode, 'Join the required community before chatting there.');
	const clients = [];
	for (const room of directory.rooms.values()) {
		for (const player of room.players.values()) {
			if (player[field] !== membershipId) continue;
			const client = room.roster.clientForPlayer(player.id);
			if (client) clients.push(client);
		}
	}
	return unique(clients);
}

function privateClients(directory, room, senderId, targetAddress) {
	const senderAddress = playerAddress(room.id, senderId);
	const canonicalTarget = normalizePlayerAddress(room.id, targetAddress);
	if (!targetAddress || canonicalTarget === senderAddress) {
		throw new RealtimeError('CHAT_PRIVATE_TARGET_INVALID', 'Choose another connected player.');
	}
	const senderClient = room.roster.clientForPlayer(senderId);
	const target = locateAttachedPlayer(directory, canonicalTarget);
	if (!target) throw new RealtimeError('CHAT_PRIVATE_TARGET_OFFLINE', 'That player is not connected.');
	return unique([senderClient, target.client].filter(Boolean));
}

function locateAttachedPlayer(directory, address) {
	const parsed = parsePlayerAddress(address);
	const room = directory.rooms.get(parsed.worldId);
	const player = room?.players.get(parsed.playerId);
	const client = player ? room.roster.clientForPlayer(parsed.playerId) : null;
	return player && client ? { address, client, player, room } : null;
}

function unique(values) {
	return [...new Set(values)];
}

module.exports = {
	locateAttachedPlayer,
	resolveChatRecipients
};
