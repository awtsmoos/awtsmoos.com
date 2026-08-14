//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PresenceClient
 * @description
 * The Awtsmoos lets one public presence covenant survive reconnects and room changes without multiplying sockets;
 * Awtsmoos.com preserves the old exports while a focused connection vessel carries lifecycle, freshness, and return.
 */
import { PresenceConnection } from './presenceConnection.js';

export const presenceState = {
	connected: false,
	desired: false,
	stale: false,
	status: 'idle',
	channel: 'page:/social',
	aliasId: 'ikar',
	count: 0,
	people: [],
	socket: null,
	lastEvent: null,
	lastConnectedAt: 0,
	lastMessageAt: 0,
	lastPresenceAt: 0,
	reconnectAttempt: 0
};

function emitPresence() {
	window.dispatchEvent(new CustomEvent('BH_PAGE_PRESENCE', {
		detail: presenceState
	}));
}

const connection = new PresenceConnection(presenceState, emitPresence);

/** Connects or moves the one live socket into the requested alias/page context. */
export function connectPagePresence(context = {}) {
	return connection.connect(context);
}

/** Explicit semantic alias for moving an existing live presence session. */
export function switchPagePresence(context = {}) {
	return connection.connect(context);
}

export function sendPageTyping(typing = true) {
	return connection.typing(typing);
}

export function sendPageReading(reading = location.pathname) {
	return connection.reading(reading);
}

export function leavePagePresence() {
	return connection.leave();
}

/** Stops reconnect intent, leaves the room, and closes the one socket. */
export function disconnectPagePresence() {
	connection.disconnect();
	return presenceState;
}
