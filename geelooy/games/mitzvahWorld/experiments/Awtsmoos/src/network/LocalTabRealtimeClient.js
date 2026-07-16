// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalTabRealtimeClient.js
 * @description Shares authoritative-looking player snapshots between same-origin tabs.
 * The Awtsmoos creates each browser vessel separately while sustaining one village;
 * Awtsmoos.com lets nearby tabs discover, move, and depart through one normalized client.
 */

import {
	localTabChannelName,
	localTabPlayerAddress,
	localTabPlayerId
} from './LocalTabIdentity.js';
import { LocalTabWorldState } from './LocalTabWorldState.js';

export class LocalTabRealtimeClient {
	constructor(options = {}) {
		this.BroadcastChannelClass = options.BroadcastChannelClass || globalThis.BroadcastChannel;
		this.playerId = options.playerId || localTabPlayerId(options.storage);
		this.playerAddress = localTabPlayerAddress(this.playerId);
		this.now = options.now || (() => Date.now());
		this.listeners = new Set();
		this.channel = null;
		this.worldState = null;
		this.world = null;
		this.onPageHide = () => this.stop();
	}

	async join({ worldId = 'main-village', displayName = 'Mountain Shliach' } = {}) {
		if (!this.BroadcastChannelClass) {
			throw new Error('BroadcastChannel is required for local-tab multiplayer.');
		}
		this.worldState = new LocalTabWorldState({
			playerId: this.playerId,
			displayName,
			worldId,
			now: this.now
		});
		this.channel = new this.BroadcastChannelClass(localTabChannelName(worldId));
		this.channel.addEventListener('message', event => this.receive(event.data));
		globalThis.addEventListener?.('pagehide', this.onPageHide, { once: true });
		this.publish('discover');
		this.publish('state', this.worldState.localPlayer());
		this.emit();
		return this.joinResult();
	}

	async input(forwardOrInput = 0, strafe = 0, facing = 0) {
		const player = this.worldState?.applyInput(
			normalizeInput(forwardOrInput, strafe, facing)
		);
		if (!player) return this.world;
		this.publish('state', player);
		this.emit();
		return this.world;
	}

	async heartbeat() {
		if (!this.worldState) return this.world;
		this.publish('state', this.worldState.localPlayer());
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
			this.worldState.upsert(message.player);
			this.emit();
		}
	}

	publish(type, player = null) {
		if (!this.channel || !this.worldState) return;
		this.channel.postMessage({
			type,
			player,
			senderId: this.playerId,
			worldId: this.worldState.worldId
		});
	}

	emit() {
		this.world = this.worldState?.snapshot() || null;
		for (const listener of this.listeners) listener(this.world);
	}

	joinResult() {
		return {
			playerId: this.playerId,
			playerAddress: this.playerAddress,
			world: this.world
		};
	}

	stop() {
		if (!this.channel) return;
		this.publish('leave');
		this.channel.close();
		this.channel = null;
		globalThis.removeEventListener?.('pagehide', this.onPageHide);
	}
}

function normalizeInput(forwardOrInput, strafe, facing) {
	if (forwardOrInput && typeof forwardOrInput === 'object') return forwardOrInput;
	return { forward: forwardOrInput, strafe, facing };
}
