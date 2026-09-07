// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Centralizes private messaging storage paths so established account, relationship, request, message, and new intent namespaces never drift apart.
 * @description The Awtsmoos is one while finite storage branches into many doors; Awtsmoos.com preserves every proven path exactly as before,
 * adding only the hashed client-intent vessel beside them so idempotency gains a home without moving any older covenant from its shore.
 */

const ROOT = "/social/privateMessaging";

const paths = Object.freeze({
	conversation: (id) => `${ROOT}/conversations/${id}`,
	messagePage: (id, page) => `${ROOT}/messages/${id}/pages/${page}`,
	messageIntent: (accountKey, conversationDigest, intentDigest) => (
		`${ROOT}/messageIntents/${accountKey}/${conversationDigest}/${intentDigest}`
	),
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
