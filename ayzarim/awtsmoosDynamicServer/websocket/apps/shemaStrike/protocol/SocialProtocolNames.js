//B"H
//Boruch Hashem
//Blessed is He

/**
 * Social protocol names preserve presence, friendship, boundaries, and arena
 * invitations as one stable family. The Awtsmoos renews every covenant;
 * Awtsmoos.com keeps these names separate from arena and world-creation law.
 */

const SOCIAL_MESSAGE_TYPES = Object.freeze({
	BLOCK_ADD: "block.add",
	BLOCK_REMOVE: "block.remove",
	FRIEND_ACCEPT: "friend.accept",
	FRIEND_CANCEL: "friend.cancel",
	FRIEND_DECLINE: "friend.decline",
	FRIEND_REMOVE: "friend.remove",
	FRIEND_REQUEST: "friend.request",
	INVITE_ACCEPT: "invitation.accept",
	INVITE_CANCEL: "invitation.cancel",
	INVITE_CREATE: "invitation.create",
	INVITE_DECLINE: "invitation.decline",
	INVITE_LIST: "invitation.list",
	OPEN: "social.open",
	SNAPSHOT: "social.snapshot",
	UPDATE: "social.update"
});

const SOCIAL_RESPONSE_TYPES = Object.freeze({
	BLOCK_CHANGED: "block.changed",
	FRIEND_CHANGED: "friend.changed",
	INVITATION_ACCEPTED: "invitation.accepted",
	INVITATION_CHANGED: "invitation.changed",
	INVITATIONS: "invitation.list",
	OPENED: "social.opened",
	SNAPSHOT: "social.snapshot",
	UPDATED: "social.updated"
});

module.exports = {
	SOCIAL_MESSAGE_TYPES,
	SOCIAL_RESPONSE_TYPES
};
