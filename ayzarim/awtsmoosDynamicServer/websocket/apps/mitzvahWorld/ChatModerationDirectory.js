// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChatModerationDirectory.js
 * @description Owns personal mute/block choices and delegates the durable report workflow.
 * The Awtsmoos preserves speech without forcing every vessel to receive every word;
 * Awtsmoos.com keeps concealment, evidence, adjudication, filtering, and restart truth distinct.
 */
const { RealtimeError } = require('../../platform/RealtimeError.js');
const { normalizePlayerAddress, playerAddress } = require('./PlayerAddress.js');
const { ChatReportLedger } = require('./ChatReportLedger.js');
const {
	ensureModeration,
	moderationField,
	moderationPlayerForClient
} = require('./ChatModerationState.js');

class ChatModerationDirectory {
	constructor(options = {}) {
		this.reports = new ChatReportLedger({
			clock: options.clock,
			limit: options.reportLimit
		});
	}
	command(_directory, room, player, action, targetValue) {
		const field = moderationField(action);
		if (!field) {
			throw new RealtimeError(
				'CHAT_MODERATION_ACTION_INVALID',
				'Choose mute, unmute, block, or unblock.'
			);
		}
		const targetAddress = normalizePlayerAddress(room.id, targetValue);
		requireOtherPlayer(room, player, targetAddress, 'CHAT_MODERATION_TARGET_INVALID');
		const state = ensureModeration(player);
		const values = new Set(state[field]);
		if (action.startsWith('un')) values.delete(targetAddress);
		else values.add(targetAddress);
		state[field] = [...values].sort();
		return this.snapshot(player);
	}
	report(_directory, room, player, command) {
		const targetAddress = normalizePlayerAddress(room.id, command.targetPlayerId);
		requireOtherPlayer(room, player, targetAddress, 'CHAT_REPORT_TARGET_INVALID');
		return this.reports.create(room, player, { ...command, targetAddress });
	}
	review(player, limit) {
		return this.reports.review(player, limit);
	}
	adjudicate(room, player, command) {
		return this.reports.adjudicate(room, player, command);
	}
	snapshot(player) {
		const state = ensureModeration(player);
		return {
			blockedPlayerAddresses: [...state.blockedPlayerAddresses],
			moderator: Boolean(player.profile?.moderator),
			mutedPlayerAddresses: [...state.mutedPlayerAddresses]
		};
	}
	filterRecipients(directory, room, sender, clients) {
		const address = playerAddress(room.id, sender.id);
		return clients.filter(client => {
			const recipient = moderationPlayerForClient(directory, client);
			if (!recipient || recipient === sender) return true;
			const state = ensureModeration(recipient);
			return !state.blockedPlayerAddresses.includes(address)
				&& !state.mutedPlayerAddresses.includes(address);
		});
	}
	filterHistory(player, history) {
		const state = ensureModeration(player);
		const hidden = new Set([
			...state.blockedPlayerAddresses,
			...state.mutedPlayerAddresses
		]);
		return {
			...history,
			messages: history.messages.filter(message => !hidden.has(message.from?.address))
		};
	}
	capture() {
		return this.reports.capture();
	}
	restore(record = {}) {
		this.reports.restore(record);
	}
}

function requireOtherPlayer(room, player, targetAddress, code) {
	if (targetAddress !== playerAddress(room.id, player.id)) return;
	throw new RealtimeError(code, 'Choose another player.');
}

module.exports = { ChatModerationDirectory };
