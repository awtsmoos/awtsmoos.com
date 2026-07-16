// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalTabRealtimeClient.js
 * @description Discovers localhost tabs and exchanges exact world-space player snapshots.
 * The Awtsmoos creates each tab and message separately; Awtsmoos.com keeps discovery,
 * ordering, heartbeat, explicit leave, and stale cleanup behind one normalized client.
 */

import {
	localTabChannelName,
	localTabPlayerAddress,
	localTabPlayerId
} from './LocalTabIdentity.js';
import { LocalTabWorldState } from './LocalTabWorldState.js';

const DEFAULT_HEARTBEAT_MS = 2000;

export class LocalTabRealtimeClient {
	constructor(options = {}) {
		this.BroadcastChannelClass = options.BroadcastChannelClass || globalThis.BroadcastChannel;
		this.playerId = options.playerId || localTabPlayerId(
			options.storage,
			options.identityScope || globalThis
		);
		this.playerAddress = localTabPlayerAddress(this.playerId);
		this.now = options.now || (() => Date.now());
		this.connectionStartedAt = this.now();
		this.connectionId = options.connectionId || connectionToken(this.playerId);
		this.staleAfterMs = options.staleAfterMs;
		this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_MS;
		this.scheduleHeartbeat = options.scheduleHeartbeat || globalThis.setInterval;
		this.cancelHeartbeat = options.cancelHeartbeat || globalThis.clearInterval;
		this.listeners = new Set();
		this.activeConnectionBySender = new Map();
		this.closedConnections = new Set();
		this.lastSequenceByConnection = new Map();
		this.channel = null;
		this.connected = false;
		this.heartbeatTimer = null;
		this.hasJoined = false;
		this.sequence = 0;
		this.worldState = null;
		this.world = null;
		this.receiveBound = event => this.receive(event.data);
		this.onPageHide = () => this.stop();
	}

	async join({
		worldId = 'main-village',
		displayName = 'Mountain Shliach',
		playerState = {}
	} = {}) {
		if (!this.BroadcastChannelClass) {
			throw new Error('BroadcastChannel is required for local-tab multiplayer.');
		}
		if (this.channel) this.stop();
		this.beginConnection();
		this.worldState = new LocalTabWorldState({
			displayName,
			initialPlayerState: playerState,
			now: this.now,
			playerId: this.playerId,
			staleAfterMs: this.staleAfterMs,
			worldId
		});
		this.channel = new this.BroadcastChannelClass(localTabChannelName(worldId));
		this.channel.addEventListener('message', this.receiveBound);
		this.connected = true;
		globalThis.addEventListener?.('pagehide', this.onPageHide, { once: true });
		this.startHeartbeat();
		this.publish('discover');
		this.publish('state', this.worldState.localPlayer());
		this.emit();
		return this.joinResult();
	}

	async updatePlayerState(playerState = {}) {
		const player = this.worldState?.applyTransform(playerState);
		if (!player) return this.world;
		this.publish('state', player);
		this.emit();
		return this.world;
	}

	async input(playerState = {}) {
		if (!isWorldTransform(playerState)) return this.world;
		return this.updatePlayerState(playerState);
	}

	async heartbeat() {
		if (!this.worldState || !this.connected) return this.world;
		const player = this.worldState.touchLocal();
		this.publish('state', player);
		this.emit();
		return this.world;
	}

	onWorld(listener) {
		this.listeners.add(listener);
		if (this.world) listener(this.world);
		return () => this.listeners.delete(listener);
	}

	receive(message) {
		if (!message || message.senderId === this.playerId || !this.worldState) return;
		if (message.worldId !== this.worldState.worldId) return;
		if (!this.acceptEnvelope(message)) return;
		if (message.type === 'discover') {
			this.publish('state', this.worldState.localPlayer());
			return;
		}
		if (message.type === 'leave') {
			this.worldState.remove(message.senderId);
			this.emit();
			return;
		}
		if (message.type === 'state' && message.player) {
			this.worldState.upsert({
				...message.player,
				id: message.senderId
			});
			this.emit();
		}
	}

	publish(type, player = null) {
		if (!this.channel || !this.worldState) return;
		this.sequence += 1;
		this.channel.postMessage({
			connectionId: this.connectionId,
			connectionStartedAt: this.connectionStartedAt,
			player,
			senderId: this.playerId,
			sentAt: this.now(),
			sequence: this.sequence,
			type,
			worldId: this.worldState.worldId
		});
	}

	emit() {
		this.world = this.worldState?.snapshot() || null;
		for (const listener of this.listeners) listener(this.world);
	}

	joinResult() {
		return {
			playerAddress: this.playerAddress,
			playerId: this.playerId,
			transport: 'local-tab',
			world: this.world
		};
	}

	stop() {
		this.stopHeartbeat();
		if (this.channel) {
			this.publish('leave');
			this.channel.removeEventListener?.('message', this.receiveBound);
			this.channel.close();
		}
		this.channel = null;
		this.connected = false;
		this.activeConnectionBySender.clear();
		this.closedConnections.clear();
		this.lastSequenceByConnection.clear();
		globalThis.removeEventListener?.('pagehide', this.onPageHide);
	}

	startHeartbeat() {
		this.stopHeartbeat();
		if (!this.scheduleHeartbeat || this.heartbeatIntervalMs <= 0) return;
		this.heartbeatTimer = this.scheduleHeartbeat(
			() => { this.heartbeat().catch(() => {}); },
			this.heartbeatIntervalMs
		);
		this.heartbeatTimer?.unref?.();
	}

	stopHeartbeat() {
		if (this.heartbeatTimer === null) return;
		this.cancelHeartbeat?.(this.heartbeatTimer);
		this.heartbeatTimer = null;
	}

	beginConnection() {
		if (this.hasJoined) {
			this.connectionStartedAt = Math.max(
				this.now(),
				this.connectionStartedAt + 1
			);
			this.connectionId = connectionToken(this.playerId);
		}
		this.hasJoined = true;
		this.sequence = 0;
		this.activeConnectionBySender.clear();
		this.closedConnections.clear();
		this.lastSequenceByConnection.clear();
	}

	acceptEnvelope(message) {
		const connection = envelopeConnection(message);
		const connectionKey = `${message.senderId}\u0000${connection.id}`;
		if (this.closedConnections.has(connectionKey)) return false;
		const active = this.activeConnectionBySender.get(message.senderId);
		if (active && active.id !== connection.id) {
			if (compareConnections(connection, active) < 0) return false;
		}
		this.activeConnectionBySender.set(message.senderId, connection);
		const sequence = Number(message.sequence);
		if (Number.isSafeInteger(sequence) && sequence > 0) {
			const previous = this.lastSequenceByConnection.get(connectionKey) || 0;
			if (sequence <= previous) return false;
			this.lastSequenceByConnection.set(connectionKey, sequence);
		}
		if (message.type === 'leave') this.closedConnections.add(connectionKey);
		return true;
	}
}

function envelopeConnection(message) {
	return {
		id: String(message.connectionId || 'legacy'),
		startedAt: finite(message.connectionStartedAt, 0)
	};
}

function compareConnections(left, right) {
	if (left.startedAt !== right.startedAt) return left.startedAt - right.startedAt;
	return left.id.localeCompare(right.id);
}

function connectionToken(playerId) {
	return `${playerId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function isWorldTransform(value) {
	return Boolean(value && typeof value === 'object' && (
		value.position
		|| Object.hasOwn(value, 'x')
		|| Object.hasOwn(value, 'y')
		|| Object.hasOwn(value, 'z')
		|| Object.hasOwn(value, 'moving')
	));
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
