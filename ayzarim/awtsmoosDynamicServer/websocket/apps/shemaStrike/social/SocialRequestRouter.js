//B"H
//Boruch Hashem
//Blessed is He

/**
 * The social router maps stable names to verified coordinator acts. The Awtsmoos
 * renews every request; Awtsmoos.com refuses payload-authored actors and keeps
 * social command growth outside the arena and shared transport routers.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");
const { SOCIAL_MESSAGE_TYPES, SOCIAL_RESPONSE_TYPES } = require("../protocol.js");

class SocialRequestRouter {
	constructor(coordinator) {
		this.social = coordinator;
		this.handlers = new Map([
			[SOCIAL_MESSAGE_TYPES.OPEN, (client, payload) => this.wrap("OPENED", this.social.open(client, payload))],
			[SOCIAL_MESSAGE_TYPES.UPDATE, (client, payload) => this.wrap("UPDATED", this.social.update(client, payload))],
			[SOCIAL_MESSAGE_TYPES.SNAPSHOT, (client) => this.wrap("SNAPSHOT", this.social.snapshot(client))],
			[SOCIAL_MESSAGE_TYPES.FRIEND_REQUEST, (client, payload) => this.wrap("FRIEND_CHANGED", this.social.friendRequest(client, payload.targetId))],
			[SOCIAL_MESSAGE_TYPES.FRIEND_ACCEPT, (client, payload) => this.friendResolve(client, payload, "accept")],
			[SOCIAL_MESSAGE_TYPES.FRIEND_DECLINE, (client, payload) => this.friendResolve(client, payload, "decline")],
			[SOCIAL_MESSAGE_TYPES.FRIEND_CANCEL, (client, payload) => this.friendResolve(client, payload, "cancel")],
			[SOCIAL_MESSAGE_TYPES.FRIEND_REMOVE, (client, payload) => this.wrap("FRIEND_CHANGED", this.social.friendRemove(client, payload.targetId))],
			[SOCIAL_MESSAGE_TYPES.BLOCK_ADD, (client, payload) => this.wrap("BLOCK_CHANGED", this.social.block(client, payload.targetId))],
			[SOCIAL_MESSAGE_TYPES.BLOCK_REMOVE, (client, payload) => this.wrap("BLOCK_CHANGED", this.social.unblock(client, payload.targetId))],
			[SOCIAL_MESSAGE_TYPES.INVITE_CREATE, (client, payload) => this.wrap("INVITATION_CHANGED", this.social.invite(client, payload))],
			[SOCIAL_MESSAGE_TYPES.INVITE_ACCEPT, (client, payload) => this.wrap("INVITATION_ACCEPTED", this.social.invitationAccept(client, payload.invitationId))],
			[SOCIAL_MESSAGE_TYPES.INVITE_DECLINE, (client, payload) => this.invitationResolve(client, payload, "decline")],
			[SOCIAL_MESSAGE_TYPES.INVITE_CANCEL, (client, payload) => this.invitationResolve(client, payload, "cancel")],
			[SOCIAL_MESSAGE_TYPES.INVITE_LIST, (client) => this.wrap("INVITATIONS", this.social.snapshot(client).invitations)]
		]);
	}

	handle(client, request) {
		const handler = this.handlers.get(request.type);
		if (!handler) {
			throw new RealtimeError("UNKNOWN_SOCIAL_MESSAGE", `Unknown Shema Strike social message: ${request.type}`);
		}
		return handler(client, request.payload || {});
	}

	friendResolve(client, payload, action) {
		return this.wrap(
			"FRIEND_CHANGED",
			this.social.friendResolve(client, payload.requestId, action)
		);
	}

	invitationResolve(client, payload, action) {
		return this.wrap(
			"INVITATION_CHANGED",
			this.social.invitationResolve(client, payload.invitationId, action)
		);
	}

	wrap(key, payload) {
		return {
			payload,
			type: SOCIAL_RESPONSE_TYPES[key]
		};
	}
}

module.exports = {
	SocialRequestRouter
};
