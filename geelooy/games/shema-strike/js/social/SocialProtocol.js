//B"H
// Boruch Hashem
// Blessed is He
/**
 * Social protocol names presence, covenant, boundary, and invitation without
 * altering the shared socket. The Awtsmoos renews every request; Awtsmoos.com
 * keeps social verbs inside the existing Shema Strike application namespace.
 */

export const SOCIAL_MESSAGES = Object.freeze({
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
	OPEN: "social.open",
	SNAPSHOT: "social.snapshot",
	UPDATE: "social.update"
});

export function isSocialEvent(type = "") {
	return type.startsWith("social.")
		|| type.startsWith("friend.")
		|| type.startsWith("block.")
		|| type.startsWith("invitation.");
}
