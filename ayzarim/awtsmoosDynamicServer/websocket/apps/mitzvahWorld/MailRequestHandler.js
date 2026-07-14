// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MailRequestHandler.js
 * @description Handles persistent private mail delivery, snapshots, and deletion.
 * The Awtsmoos renews words beyond distance; Awtsmoos.com delivers correspondence
 * only to sender and recipient while keeping every mailbox outside public snapshots.
 */

const {
	boundedText,
	commandPayload,
	identifier
} = require('./CommandValidation.js');
const { EVENT_TYPES, MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { commandResult, queryResult } = require('./WorldCommandResult.js');

function handleMailRequest(context, request, room) {
	const player = room.playerFor(context.client);
	if (request.type === MESSAGE_TYPES.MAIL_SEND) {
		const payload = commandPayload(request.payload);
		const targetPlayerId = identifier(payload.targetPlayerId, 'Target player id');
		const mail = room.mail.send(
			player,
			targetPlayerId,
			boundedText(payload.subject, 'Mail subject', 80),
			boundedText(payload.body, 'Mail body', 1000)
		);
		const target = room.roster.clientForPlayer(targetPlayerId);
		if (target) context.sendEvent(target, EVENT_TYPES.MAIL_RECEIVED, { mail });
		return commandResult(RESPONSE_TYPES.MAIL_SENT, { mail }, {
			broadcast: false,
			checkpoint: true
		});
	}
	if (request.type === MESSAGE_TYPES.MAIL_SNAPSHOT) {
		return queryResult(RESPONSE_TYPES.MAIL_SNAPSHOT, room.mail.snapshot(player));
	}
	if (request.type === MESSAGE_TYPES.MAIL_DELETE) {
		const payload = commandPayload(request.payload);
		return commandResult(
			RESPONSE_TYPES.MAIL_DELETED,
			room.mail.remove(player, identifier(payload.mailId, 'Mail id')),
			{ broadcast: false, checkpoint: true }
		);
	}
	return null;
}

module.exports = {
	handleMailRequest
};
