// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GuildRequestHandler.js
 * @description Handles persistent invitation-led guild membership and snapshots.
 * The Awtsmoos renews community through willing bonds; Awtsmoos.com reveals guild
 * detail only to members and invitees while public worlds expose merely guild IDs.
 */

const {
	boundedText,
	commandPayload,
	identifier
} = require('./CommandValidation.js');
const { EVENT_TYPES, MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { commandResult, queryResult } = require('./WorldCommandResult.js');

function handleGuildRequest(context, request, room) {
	const player = room.playerFor(context.client);
	if (request.type === MESSAGE_TYPES.GUILD_CREATE) {
		const payload = commandPayload(request.payload);
		return changed(context, room, RESPONSE_TYPES.GUILD_CREATED, room.guilds.create(
			player,
			boundedText(payload.name, 'Guild name', 48)
		));
	}
	if (request.type === MESSAGE_TYPES.GUILD_INVITE) {
		const payload = commandPayload(request.payload);
		const invitation = room.guilds.invite(
			player,
			identifier(payload.targetPlayerId, 'Target player id')
		);
		return invitationResult(context, room, invitation);
	}
	if (request.type === MESSAGE_TYPES.GUILD_JOIN) {
		const payload = commandPayload(request.payload);
		return changed(context, room, RESPONSE_TYPES.GUILD_JOINED, room.guilds.join(
			player,
			identifier(payload.guildId, 'Guild id')
		));
	}
	if (request.type === MESSAGE_TYPES.GUILD_LEAVE) {
		return changed(context, room, RESPONSE_TYPES.GUILD_LEFT, room.guilds.leave(player));
	}
	if (request.type === MESSAGE_TYPES.GUILD_KICK) {
		const payload = commandPayload(request.payload);
		return changed(context, room, RESPONSE_TYPES.GUILD_KICKED, room.guilds.kick(
			player,
			identifier(payload.targetPlayerId, 'Target player id')
		));
	}
	if (request.type === MESSAGE_TYPES.GUILD_SNAPSHOT) {
		return queryResult(RESPONSE_TYPES.GUILD_SNAPSHOT, {
			guild: room.guilds.snapshotFor(player)
		});
	}
	return null;
}

function invitationResult(context, room, invitation) {
	const target = room.roster.clientForPlayer(invitation.targetPlayerId);
	if (target) context.sendEvent(target, EVENT_TYPES.GUILD_CHANGED, { invitation });
	return commandResult(RESPONSE_TYPES.GUILD_INVITED, { invitation }, {
		broadcast: false,
		checkpoint: true
	});
}

function changed(context, room, type, guild) {
	room.record('guild.updated', { guildId: guild?.id || null });
	if (guild) {
		for (const playerId of guild.memberIds) {
			const target = room.roster.clientForPlayer(playerId);
			if (target) context.sendEvent(target, EVENT_TYPES.GUILD_CHANGED, { guild });
		}
	}
	return commandResult(type, { guild }, {
		broadcast: true,
		checkpoint: true
	});
}

module.exports = {
	handleGuildRequest
};
