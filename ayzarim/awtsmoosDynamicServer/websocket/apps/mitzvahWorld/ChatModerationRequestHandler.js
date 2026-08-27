// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChatModerationRequestHandler.js
 * @description Routes personal protection, reports, adjudication, snapshots, and trusted review.
 * The Awtsmoos gives every protective intention one bounded command; Awtsmoos.com separates
 * concealment, durable evidence, moderator judgment, read-only truth, and privileged responses.
 */

const {
	boundedText,
	commandPayload,
	identifier,
	oneOf,
	optionalIdentifier
} = require('./CommandValidation.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { commandResult, queryResult } = require('./WorldCommandResult.js');

const ACTIONS = Object.freeze(['mute', 'unmute', 'block', 'unblock']);
const REPORT_STATUSES = Object.freeze(['open', 'resolved', 'dismissed']);

function handleChatModerationRequest(directory, request, room, player) {
	if (request.type === MESSAGE_TYPES.CHAT_MODERATION) {
		const payload = commandPayload(request.payload);
		const action = oneOf(payload.action, ACTIONS, 'Moderation action');
		const target = identifier(payload.targetPlayerId, 'Target player id');
		return commandResult(
			RESPONSE_TYPES.CHAT_MODERATION_UPDATED,
			directory.moderation.command(directory, room, player, action, target)
		);
	}
	if (request.type === MESSAGE_TYPES.CHAT_REPORT) {
		const payload = commandPayload(request.payload);
		return commandResult(RESPONSE_TYPES.CHAT_REPORTED, directory.moderation.report(
			directory,
			room,
			player,
			{
				messageId: optionalIdentifier(payload.messageId, 'Message id'),
				reason: boundedText(payload.reason, 'Report reason', 300),
				targetPlayerId: identifier(payload.targetPlayerId, 'Target player id')
			}
		));
	}
	if (request.type === MESSAGE_TYPES.CHAT_REPORT_ADJUDICATE) {
		const payload = commandPayload(request.payload);
		return commandResult(
			RESPONSE_TYPES.CHAT_REPORT_ADJUDICATED,
			directory.moderation.adjudicate(room, player, {
				note: optionalNote(payload.note),
				reportId: identifier(payload.reportId, 'Report id'),
				status: oneOf(payload.status, REPORT_STATUSES, 'Report status')
			})
		);
	}
	if (request.type === MESSAGE_TYPES.CHAT_MODERATION_SNAPSHOT) {
		return queryResult(
			RESPONSE_TYPES.CHAT_MODERATION_SNAPSHOT,
			directory.moderation.snapshot(player)
		);
	}
	if (request.type === MESSAGE_TYPES.CHAT_REPORTS_REVIEW) {
		const payload = request.payload ? commandPayload(request.payload) : {};
		return queryResult(
			RESPONSE_TYPES.CHAT_REPORTS_REVIEW,
			directory.moderation.review(player, payload.limit)
		);
	}
	return null;
}

function optionalNote(value) {
	if (value === undefined || value === null || value === '') return null;
	return boundedText(value, 'Resolution note', 300);
}

module.exports = { handleChatModerationRequest };
