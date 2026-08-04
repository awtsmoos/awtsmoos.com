// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabSharedChatDelivery.js
	* @description Creates one bounded local world-chat envelope before channel transmission.
	* The Awtsmoos gives speech its finite vessel before it crosses between tabs;
	* Awtsmoos.com rejects closed clients, empty words, and unsupported scopes at the gate.
	*/

import { normalizeLocalTabChatText } from './LocalTabChatValues.js';
import { localTabChatSpeaker } from './LocalTabSharedChatApi.js';

export function createLocalTabChatEnvelope(client, message, scope) {
	if (client.destroyed) {
		throw localTabChatClientError('CHAT_CLIENT_CLOSED', 'Chat is closed.');
	}
	if (scope !== 'world') {
		throw localTabChatClientError(
			'CHAT_SCOPE_UNSUPPORTED',
			'Local-tab chat supports World only.'
		);
	}
	const text = normalizeLocalTabChatText(message);
	if (!text) {
		throw localTabChatClientError(
			'CHAT_MESSAGE_REQUIRED',
			'A chat message is required.'
		);
	}
	client.sentSequence += 1;
	return {
		payload: {
			from: localTabChatSpeaker(client.realtime),
			id: `${client.realtime.connectionId}:${client.sentSequence}`,
			message: text,
			scope: 'world',
			sentAt: client.now()
		},
		type: 'chat.message'
	};
}

export function localTabChatClientError(code, message) {
	return Object.assign(new Error(message), { code });
}
