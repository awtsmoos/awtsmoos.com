// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChatChannelDirectory.js
 * @description Owns bounded histories for global, world, party, guild, and private chat.
 * The Awtsmoos renews speech within measured vessels; Awtsmoos.com validates every
 * globally addressed recipient before history or transport state may change.
 */

const { resolveChatRecipients } = require('./ChatRecipientResolver.js');
const {
	boundedChatHistoryLimit,
	chatChannelKey,
	chatChannelSummary,
	validateChatHistoryAccess
} = require('./ChatChannelPolicy.js');
const {
	normalizePlayerAddress,
	playerAddress
} = require('./PlayerAddress.js');

class ChatChannelDirectory {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
		this.historyLimit = Math.max(10, Number(options.historyLimit || 100));
		this.histories = new Map();
		this.nextMessage = 1;
	}

	send(directory, room, player, command) {
		const targetAddress = command.scope === 'private'
			? normalizePlayerAddress(room.id, command.targetPlayerId)
			: null;
		const clients = resolveChatRecipients(
			directory,
			room,
			player,
			command.scope,
			targetAddress
		);
		const channel = chatChannelKey(room, player, command.scope, targetAddress);
		const message = createChatMessage(
			this,
			room,
			player,
			command,
			channel,
			targetAddress
		);
		this.append(channel, message);
		return { clients, message };
	}

	history(room, player, scope, targetAddress, limit = 50) {
		validateChatHistoryAccess(room, player, scope, targetAddress);
		const channel = chatChannelKey(room, player, scope, targetAddress);
		const history = this.histories.get(channel) || [];
		return {
			channel,
			messages: clone(history.slice(-boundedChatHistoryLimit(limit))),
			scope
		};
	}

	channels(room, player) {
		return {
			channels: [
				chatChannelSummary(this, 'global', 'global'),
				chatChannelSummary(this, 'world', `world:${room.id}`),
				player.partyId
					? chatChannelSummary(this, 'party', `party:${player.partyId}`)
					: null,
				player.guildId
					? chatChannelSummary(this, 'guild', `guild:${player.guildId}`)
					: null
			].filter(Boolean)
		};
	}

	append(channel, message) {
		const history = this.histories.get(channel) || [];
		history.push(clone(message));
		if (history.length > this.historyLimit) {
			history.splice(0, history.length - this.historyLimit);
		}
		this.histories.set(channel, history);
	}
}

function createChatMessage(directory, room, player, command, channel, targetAddress) {
	return {
		channel,
		from: {
			address: playerAddress(room.id, player.id),
			displayName: player.displayName,
			id: player.id
		},
		id: `chat-${directory.nextMessage++}`,
		message: command.message,
		scope: command.scope,
		sentAt: directory.clock(),
		to: targetAddress,
		worldId: room.id
	};
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	ChatChannelDirectory
};
