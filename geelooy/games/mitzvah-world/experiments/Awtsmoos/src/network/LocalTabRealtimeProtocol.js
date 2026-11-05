// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabRealtimeProtocol.js
	* @description Publishes and receives validated ordered local-tab world envelopes.
	* The Awtsmoos speaks through separate windows without letting strange words rename a vessel;
	* Awtsmoos.com validates lawful intent before generation, sequence, and shared-world consequence.
	*/

import { createLocalTabAuthorityApi } from './LocalTabAuthorityApi.js';
import { LocalTabAuthorityStore } from './LocalTabAuthorityStore.js';

const ORDERED_TYPES = new Set(['leave', 'state']);

export function createLocalTabClientAuthority(client, worldId) {
	return createLocalTabAuthorityApi(new LocalTabAuthorityStore({
		playerId: client.playerId,
		storage: client.persistentStorage,
		worldId
	}));
}

export function localTabInputTransform(first, strafe, facing) {
	if (first && typeof first === 'object') return first;
	return {
		facing,
		moving: Math.abs(Number(first) || 0)
			+ Math.abs(Number(strafe) || 0) > 0.001
	};
}

export function publishLocalTabEnvelope(client, type, player = null) {
	if (!client.channel || !client.worldState || !client.ledger.connection) return false;
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
	return true;
}

export function receiveLocalTabEnvelope(client, message) {
	if (!basicLocalTabEnvelope(client, message)) return false;
	if (message.type === 'discover') {
		publishLocalTabEnvelope(
			client,
			'state',
			client.worldState.localPlayer()
		);
		return true;
	}
	if (!orderedLocalTabEnvelope(message) || !client.ledger.accept(message)) {
		return false;
	}
	if (message.type === 'leave') {
		client.worldState.remove(message.senderId);
		emitLocalTabWorld(client);
		return true;
	}
	client.worldState.upsert({
		...message.player,
		id: message.senderId
	});
	emitLocalTabWorld(client);
	return true;
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

function basicLocalTabEnvelope(client, message) {
	return Boolean(
		message
		&& typeof message === 'object'
		&& typeof message.senderId === 'string'
		&& message.senderId.length > 0
		&& message.senderId !== client.playerId
		&& client.worldState
		&& message.worldId === client.worldState.worldId
		&& (message.type === 'discover' || ORDERED_TYPES.has(message.type))
	);
}

function orderedLocalTabEnvelope(message) {
	if (message.type === 'leave') return true;
	return Boolean(
		message.type === 'state'
		&& message.player
		&& typeof message.player === 'object'
		&& !Array.isArray(message.player)
		&& message.player.id === message.senderId
	);
}
