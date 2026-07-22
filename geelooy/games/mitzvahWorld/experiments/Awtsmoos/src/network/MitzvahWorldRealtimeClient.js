// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldRealtimeClient.js
 * @description Browser client with recovery, deltas, census, events, and bounded requests.
 * The Awtsmoos renews each private session garment; Awtsmoos.com separates public address,
 * private resume token, world state, and a transport that cannot wait without end.
 */

import { createMitzvahWorldJoinKey } from './MitzvahWorldJoinKey.js';
import { MitzvahWorldEventHub } from './MitzvahWorldEventHub.js';
import { MitzvahWorldMmorpgApi } from './MitzvahWorldMmorpgApi.js';
import { MitzvahWorldTransport } from './MitzvahWorldTransport.js';
import { applyWorldDelta } from './WorldDeltaStore.js';

export class MitzvahWorldRealtimeClient {
	constructor(socket, options = {}) {
		this.events = new MitzvahWorldEventHub();
		this.joinKey = createMitzvahWorldJoinKey();
		this.listeners = new Set();
		this.needsResync = false;
		this.playerAddress = null;
		this.playerId = null;
		this.session = null;
		this.world = null;
		this.transport = new MitzvahWorldTransport(
			socket,
			message => this.receive(message),
			options.transport || options
		);
		this.mmorpg = new MitzvahWorldMmorpgApi((type, payload) => this.send(type, payload));
	}

	static connect(url, WebSocketClass = globalThis.WebSocket, options = {}) {
		if (!WebSocketClass) throw new Error('WebSocket is unavailable.');
		return new MitzvahWorldRealtimeClient(new WebSocketClass(url), options);
	}

	get socket() { return this.transport.socket; }
	census() { return this.send('world.census'); }
	join(displayName, worldId = 'main-village') {
		return this.send('world.join', { displayName, joinKey: this.joinKey, worldId });
	}
	async reconnect(socket) {
		if (!this.session?.resumeToken) throw new Error('No resumable Mitzvah World session exists.');
		const revision = this.world?.revision ?? 0;
		this.transport.replaceSocket(socket);
		const joined = await this.send('world.join', {
			lastAcknowledgedRevision: revision,
			resumeToken: this.session.resumeToken
		});
		await this.resync(revision);
		return joined;
	}
	input(forward, strafe, facing) { return this.send('player.input', { facing, forward, strafe }); }
	startQuest(questId = 'first-tefillin-shlichus') { return this.send('quest.start', { questId }); }
	interact(questId, npcId, action) { return this.send('quest.interact', { action, npcId, questId }); }
	spawnBots(count = 1, seed = 613, displayName = 'Shliach Bot') {
		return this.send('bot.spawn', { count, displayName, seed });
	}
	resync(lastAcknowledgedRevision = this.world?.revision ?? 0) {
		return this.send('world.resync', { lastAcknowledgedRevision });
	}
	heartbeat(lastAcknowledgedRevision = this.world?.revision ?? 0) {
		return this.send('world.heartbeat', { lastAcknowledgedRevision });
	}
	on(type, listener) { return this.events.on(type, listener); }
	onWorld(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}
	send(type, payload = {}) { return this.transport.send(type, payload); }
	receive(message) {
		this.events.emit(message);
		if (message.type === 'session.revoked') {
			this.playerAddress = null;
			this.playerId = null;
			this.session = null;
			this.world = null;
			this.needsResync = false;
			return;
		}
		if (message.payload?.playerAddress) this.playerAddress = message.payload.playerAddress;
		if (message.payload?.playerId) this.playerId = message.payload.playerId;
		if (message.payload?.session) this.session = { ...message.payload.session };
		if (message.payload?.world) this.publishWorld(message.payload.world);
		if (message.payload?.delta && this.world) {
			this.needsResync = Boolean(message.payload.delta.fullSnapshotRequired);
			this.publishWorld(applyWorldDelta(this.world, message.payload.delta));
		}
	}
	publishWorld(world) {
		if (this.world && Number(world.revision) < Number(this.world.revision)) return;
		this.world = world;
		if (!this.needsResync) this.needsResync = false;
		for (const listener of this.listeners) listener(world);
	}
}
