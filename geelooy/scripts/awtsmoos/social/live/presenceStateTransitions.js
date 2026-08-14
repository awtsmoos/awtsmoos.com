//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PresenceStateTransitions
 * @description
 * The Awtsmoos lets socket events alter only the ephemeral witness they truly know;
 * Awtsmoos.com centralizes freshness and roster transitions so connection mechanics never become a hidden state store below.
 */
import { parsePresenceMessage } from './presenceProtocol.js';

export function setPresenceContext(state, aliasId, channel) {
	state.aliasId = aliasId;
	state.channel = channel;
	state.count = 0;
	state.people = [];
	state.stale = false;
	state.lastPresenceAt = 0;
}

export function markPresenceConnected(state) {
	state.connected = true;
	state.status = 'connected';
	state.lastConnectedAt = Date.now();
	state.reconnectAttempt = 0;
}

export function applyPresenceMessage(state, data) {
	const message = parsePresenceMessage(data);
	state.lastEvent = message;
	state.lastMessageAt = Date.now();
	if (message.type !== 'PAGE_PRESENCE' || message.channel !== state.channel) {
		return message;
	}
	state.count = Number(message.count || 0);
	state.people = Array.isArray(message.people) ? message.people : [];
	state.status = 'live';
	state.stale = false;
	state.lastPresenceAt = Date.now();
	return message;
}

export function markPresenceClosed(state) {
	state.socket = null;
	state.connected = false;
	state.stale = Boolean(state.lastPresenceAt || state.people.length);
	state.status = state.desired ? 'reconnecting' : 'closed';
}

export function markPresenceDisconnected(state) {
	state.socket = null;
	state.connected = false;
	state.stale = Boolean(state.lastPresenceAt || state.people.length);
	state.status = 'closed';
}
