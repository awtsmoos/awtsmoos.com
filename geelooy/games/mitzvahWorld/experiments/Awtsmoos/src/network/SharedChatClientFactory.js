// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SharedChatClientFactory.js
 * @description Normalizes deployed server chat and localhost world chat behind one panel contract.
 * The Awtsmoos gives each transport its truthful boundary; Awtsmoos.com preserves authoritative
 * scopes on servers while local tabs receive only the world room their channel can actually prove.
 */

import { LocalTabSharedChatClient } from './LocalTabSharedChatClient.js';

export function createSharedChatClient(client, transport) {
	if (client?.mmorpg?.community?.sendChat) {
		return Object.freeze({ client, destroy() {} });
	}
	if (transport === 'local-tab' && client?.BroadcastChannelClass && client?.worldState) {
		const local = new LocalTabSharedChatClient(client);
		return Object.freeze({
			client: local,
			destroy: () => local.destroy()
		});
	}
	return null;
}
