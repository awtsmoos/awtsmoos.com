// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldRealtimeState.js
	* @description Applies monotonic session, snapshot, and delta state to a realtime client.
	* The Awtsmoos renews the shared world without accepting a broken revision;
	* Awtsmoos.com isolates each observer while preserving one truthful client vessel.
	*/

import { transportFailure } from './MitzvahWorldTransportProtocol.js';
import { applyWorldDelta } from './WorldDeltaStore.js';

export function applyRealtimeMessage(client, message) {
	client.events.emit(message);
	if (message.type === 'session.revoked') {
		revokeRealtimeSession(client);
		return;
	}
	const payload = message.payload || {};
	if (payload.playerAddress) {
		client.playerAddress = payload.playerAddress;
	}
	if (payload.playerId) {
		client.playerId = payload.playerId;
	}
	if (payload.session) {
		client.session = { ...payload.session };
	}
	if (payload.world) {
		publishRealtimeWorld(client, payload.world);
	}
	if (payload.delta && client.world) {
		client.needsResync = Boolean(
			payload.delta.fullSnapshotRequired
		);
		publishRealtimeWorld(
			client,
			applyWorldDelta(client.world, payload.delta)
		);
	}
}

export function publishRealtimeWorld(client, world) {
	const revision = Number(world?.revision);
	if (!Number.isSafeInteger(revision) || revision < 0) {
		throw transportFailure(
			'INVALID_WORLD_REVISION',
			'World revision must be a non-negative safe integer.'
		);
	}
	if (client.world && revision < Number(client.world.revision)) {
		return false;
	}
	client.world = world;
	for (const listener of [...client.listeners]) {
		try {
			listener(world);
		} catch (error) {
			client.events.report(
				error,
				{ payload: world, type: 'world.snapshot' },
				listener
			);
		}
	}
	return true;
}

export function revokeRealtimeSession(client) {
	client.playerAddress = null;
	client.playerId = null;
	client.session = null;
	client.world = null;
	client.needsResync = false;
}
