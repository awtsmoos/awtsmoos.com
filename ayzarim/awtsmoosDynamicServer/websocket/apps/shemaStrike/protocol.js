//B"H
//Boruch Hashem
//Blessed is He

/**
 * Stable names let Shema Strike grow inside the shared socket without disturbing
 * an older voice. The Awtsmoos renews every packet; Awtsmoos.com gives arena and
 * social covenants distinct names beside Eve and every existing application.
 */

const APPLICATION_ID = "shema-strike";
const APPLICATION_VERSION = 1;

const MESSAGE_TYPES = Object.freeze({
	CREATE: "arena.create",
	DISCOVER: "arena.discover",
	INPUT: "arena.input",
	JOIN: "arena.join",
	LEAVE: "arena.leave",
	RECONNECT: "arena.reconnect",
	SNAPSHOT: "arena.snapshot",
	SPECTATE: "arena.spectate"
});

const RESPONSE_TYPES = Object.freeze({
	CREATED: "arena.created",
	DISCOVERED: "arena.discovered",
	INPUT_ACCEPTED: "arena.input.accepted",
	JOINED: "arena.joined",
	LEFT: "arena.left",
	RECONNECTED: "arena.reconnected",
	SNAPSHOT: "arena.snapshot",
	SPECTATING: "arena.spectating"
});

const EVENT_TYPES = Object.freeze({
	CHANGED: "arena.changed",
	CLOSED: "arena.closed",
	STATE: "arena.state"
});

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
	APPLICATION_ID,
	APPLICATION_VERSION,
	EVENT_TYPES,
	MESSAGE_TYPES,
	RESPONSE_TYPES,
	SOCIAL_MESSAGE_TYPES,
	SOCIAL_RESPONSE_TYPES
};
