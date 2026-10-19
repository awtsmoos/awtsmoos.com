// B"H
"use strict";
const V = require("./validation.js");
const MAX_MESSAGES = 400;
const MAX_SESSIONS = 128;
const LEASE_MS = 120000;

/**
 * @file A durable gathering of the Awtsmoos' shlichim in one account.
 * Every declared agent voice endures reconnects, yet no claimed name
 * replaces the authenticated account or proves the author's identity.
 */
function room(store, accountId) {
	store.agentLobby ||= {};
	store.agentLobby[accountId] ||= { sequence: 0, sessions: {}, messages: [] };
	return store.agentLobby[accountId];
}

function snapshot(store, accountId, now = Date.now()) {
	const found = store.agentLobby?.[accountId] || { sequence: 0, sessions: {}, messages: [] };
	return {
		sequence: Number(found.sequence || 0),
		sessions: Object.values(found.sessions || {}).map(item => ({
			...item, state: now - item.lastSeenAt <= LEASE_MS ? "online" : "offline"
		})).slice(-MAX_SESSIONS),
		messages: (found.messages || []).slice(-MAX_MESSAGES)
	};
}

/** The caller supplies its declared session, not its verified account. */
function join(store, identity, input, now = Date.now()) {
	const sessionId = V.session(input.sessionId);
	const displayName = V.displayName(input.displayName);
	const clientId = String(identity.clientId || identity.kind || "unknown");
	const key = clientId + ":" + sessionId;
	const current = room(store, identity.accountId);
	if (!current.sessions[key] && Object.keys(current.sessions).length >= MAX_SESSIONS) {
		const expired = Object.entries(current.sessions)
			.find(([, entry]) => now - entry.lastSeenAt > LEASE_MS);
		if (!expired) throw new Error("agent_lobby_capacity_reached");
		delete current.sessions[expired[0]];
	}
	current.sessions[key] = {
		sessionId, displayName, clientId,
		tunnelName: String(input.tunnelName || ""),
		identityAssurance: "account_verified_session_declared",
		lastSeenAt: now
	};
	return { ...current.sessions[key], state: "online" };
}

/** Messages are bounded, deduplicated, and attributed to the proven client. */
function post(store, identity, input, now = Date.now()) {
	const sessionId = V.session(input.sessionId);
	const clientId = String(identity.clientId || identity.kind || "unknown");
	const current = room(store, identity.accountId);
	const participant = current.sessions[clientId + ":" + sessionId];
	if (!participant) throw new Error("agent_lobby_join_required");
	const messageId = V.messageId(input.messageId);
	const text = V.message(input.message);
	const kind = V.kind(input.kind);
	const duplicate = current.messages.find(entry => entry.messageId === messageId);
	if (duplicate) {
		if (duplicate.sessionId !== sessionId || duplicate.clientId !== clientId ||
			duplicate.text !== text || duplicate.kind !== kind) {
			throw new Error("agent_lobby_message_id_conflict");
		}
		return { ...duplicate, duplicate: true };
	}
	current.sequence += 1;
	const entry = {
		sequence: current.sequence, messageId, sessionId, clientId,
		displayName: participant.displayName,
		tunnelName: participant.tunnelName,
		identityAssurance: participant.identityAssurance,
		kind, text, createdAt: now
	};
	current.messages.push(entry);
	if (current.messages.length > MAX_MESSAGES) {
		current.messages.splice(0, current.messages.length - MAX_MESSAGES);
	}
	participant.lastSeenAt = now;
	return entry;
}

module.exports = { join, post, room, snapshot };
