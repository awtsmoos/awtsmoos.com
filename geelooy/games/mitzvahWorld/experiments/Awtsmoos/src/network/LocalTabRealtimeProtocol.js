// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabRealtimeProtocol.js
	* @description Publishes and receives ordered local-tab world envelopes.
	* The Awtsmoos speaks through separate windows without mixing their names;
	* Awtsmoos.com turns each lawful message into one shared world of flames.
	*/

import { createLocalTabAuthorityApi } from './LocalTabAuthorityApi.js';
import { LocalTabAuthorityStore } from './LocalTabAuthorityStore.js';

export function createLocalTabClientAuthority(client, worldId) {
	return createLocalTabAuthorityApi(new LocalTabAuthorityStore({
		playerId: client.playerId,
		storage: client.persistentStorage,
		worldId
	}));
}

export function localTabInputTransform(first, strafe, facing) {
	if (first && typeof first === 'object') {
		return first;
	}
	return {
		facing,
		moving: Math.abs(Number(first) || 0) + Math.abs(Number(strafe) || 0) > 0.001
	};
}

export function publishLocalTabEnvelope(client, type, player = null) {
	if (!client.channel || !client.worldState || !client.ledger.connection) {
		return;
	}
	client.sequence += 1;
	client.channel.postMessage({
		connectionId: client.ledger.connection.id,
		connectionStartedAt: client.ledger.connection.startedAt,
		player,
		senderId: client.playerId,
		sentAt: client.now(),
		sequence: client.sequence,
		type,
		worldId: client.worldState.worldId
	});
}

export function receiveLocalTabEnvelope(client, message) {
	if (!message || message.senderId === client.playerId || !client.worldState) {
		return;
	}
	if (message.worldId !== client.worldState.worldId || !client.ledger.accept(message)) {
		return;
	}
	if (message.type === 'discover') {
		publishLocalTabEnvelope(client, 'state', client.worldState.localPlayer());
		return;
	}
	if (message.type === 'leave') {
		client.worldState.remove(message.senderId);
		emitLocalTabWorld(client);
		return;
	}
	if (message.type === 'state' && message.player) {
		client.worldState.upsert({ ...message.player, id: message.senderId });
		emitLocalTabWorld(client);
	}
}

export function emitLocalTabWorld(client) {
	client.world = client.worldState?.snapshot() || null;
	for (const listener of client.listeners) {
		listener(client.world);
	}
}

export function localTabJoinReceipt(client) {
	return {
		playerAddress: client.playerAddress,
		playerId: client.playerId,
		transport: 'local-tab',
		world: client.world
	};
}
