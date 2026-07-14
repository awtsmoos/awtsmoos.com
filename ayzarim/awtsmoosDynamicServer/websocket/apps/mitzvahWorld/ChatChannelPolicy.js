// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChatChannelPolicy.js
 * @description Defines addressed channel keys, access checks, summaries, and limits.
 * The Awtsmoos renews every channel beneath one measured boundary; Awtsmoos.com
 * keeps membership and private-pair law reusable outside the history store.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const {
	normalizePlayerAddress,
	playerAddress
} = require('./PlayerAddress.js');

function validateChatHistoryAccess(room, player, scope, targetAddress) {
	if (scope === 'party' && !player.partyId) throw membershipError('PARTY_REQUIRED', 'party');
	if (scope === 'guild' && !player.guildId) throw membershipError('GUILD_REQUIRED', 'guild');
	if (scope !== 'private') return;
	const senderAddress = playerAddress(room.id, player.id);
	const canonicalTarget = normalizePlayerAddress(room.id, targetAddress);
	if (!targetAddress || canonicalTarget === senderAddress) {
		throw new RealtimeError('CHAT_PRIVATE_TARGET_INVALID', 'Choose another player.');
	}
}

function chatChannelKey(room, player, scope, targetAddress) {
	if (scope === 'global') return 'global';
	if (scope === 'world') return `world:${room.id}`;
	if (scope === 'party') return `party:${player.partyId}`;
	if (scope === 'guild') return `guild:${player.guildId}`;
	const pair = [
		playerAddress(room.id, player.id),
		normalizePlayerAddress(room.id, targetAddress)
	].sort();
	return `private:${pair[0]}:${pair[1]}`;
}

function chatChannelSummary(directory, scope, channel) {
	return {
		channel,
		messages: directory.histories.get(channel)?.length || 0,
		scope
	};
}

function boundedChatHistoryLimit(value) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.min(Math.max(Math.floor(number), 1), 100)
		: 50;
}

function membershipError(code, membership) {
	return new RealtimeError(code, `Join a ${membership} before reading that channel.`);
}

module.exports = {
	boundedChatHistoryLimit,
	chatChannelKey,
	chatChannelSummary,
	validateChatHistoryAccess
};
