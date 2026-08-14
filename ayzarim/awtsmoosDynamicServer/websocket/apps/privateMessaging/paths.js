// B"H
// Boruch Hashem
// Blessed is He

/** @file Centralizes private messaging storage paths so account hashes, conversations, and request indexes never drift apart. */

const ROOT = "/social/privateMessaging";

const paths = Object.freeze({
	conversation: (id) => `${ROOT}/conversations/${id}`,
	messagePage: (id, page) => `${ROOT}/messages/${id}/pages/${page}`,
	userConversation: (key, id) => `${ROOT}/users/${key}/conversations/${id}`,
	userConversations: (key) => `${ROOT}/users/${key}/conversations`,
	request: (id) => `${ROOT}/requests/${id}`,
	incomingRequest: (key, id) => `${ROOT}/users/${key}/incoming/${id}`,
	incomingRequests: (key) => `${ROOT}/users/${key}/incoming`,
	outgoingRequest: (key, id) => `${ROOT}/users/${key}/outgoing/${id}`,
	outgoingRequests: (key) => `${ROOT}/users/${key}/outgoing`,
	friend: (key, other) => `${ROOT}/relationships/${key}/friends/${other}`,
	friends: (key) => `${ROOT}/relationships/${key}/friends`,
	block: (key, other) => `${ROOT}/relationships/${key}/blocks/${other}`,
	blocks: (key) => `${ROOT}/relationships/${key}/blocks`,
	settings: (key) => `${ROOT}/users/${key}/settings`
});

module.exports = { ROOT, paths };
