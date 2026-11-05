// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabRealtimeClient.js
	* @description Orchestrates one truthful local-tab multiplayer session.
	* The Awtsmoos renews each sender without confusing its vessel;
	* Awtsmoos.com carries exact state, ordered envelopes, and clean return.
	*/

import { LocalTabEnvelopeLedger } from './LocalTabEnvelopeLedger.js';
import { localTabChannelName, localTabPlayerAddress, localTabPlayerId } from './LocalTabIdentity.js';
import { LocalTabRealtimeLifecycle } from './LocalTabRealtimeLifecycle.js';
import {
	createLocalTabClientAuthority, emitLocalTabWorld, localTabInputTransform,
	localTabJoinReceipt, publishLocalTabEnvelope, receiveLocalTabEnvelope
} from './LocalTabRealtimeProtocol.js';
import { LocalTabWorldState } from './LocalTabWorldState.js';

export class LocalTabRealtimeClient {
	constructor(options = {}) {
		this.BroadcastChannelClass = options.BroadcastChannelClass || globalThis.BroadcastChannel;
		this.environment = options.environment || globalThis;
		this.now = options.now || (() => Date.now());
		this.playerId = options.playerId
			|| localTabPlayerId(options.storage, options.identityScope || this.environment);
		this.playerAddress = localTabPlayerAddress(this.playerId);
		this.persistentStorage = options.persistentStorage || this.environment.localStorage;
		this.staleAfterMs = options.staleAfterMs;
		this.listeners = new Set();
		this.ledger = new LocalTabEnvelopeLedger(this.playerId, this.now);
		this.lifecycle = new LocalTabRealtimeLifecycle(this, options);
		this.receiveBound = event => receiveLocalTabEnvelope(this, event.data);
		this.channel = null;
		this.worldState = null;
		this.world = null;
		this.mmorpg = null;
		this.connected = false;
		this.sequence = 0;
	}

	get connectionId() {
		return this.ledger.connection?.id || null;
	}

	get connectionStartedAt() {
		return this.ledger.connection?.startedAt || 0;
	}

	async join(options = {}) {
		if (!this.BroadcastChannelClass) {
			throw new Error('BroadcastChannel is required for local-tab multiplayer.');
		}
		this.stop();
		const worldId = options.worldId || 'main-village';
		this.ledger.begin();
		this.sequence = 0;
		this.worldState = new LocalTabWorldState({
			displayName: options.displayName || 'Mountain Shliach',
			initialPlayerState: options.playerState || {},
			now: this.now,
			playerId: this.playerId,
			staleAfterMs: this.staleAfterMs,
			worldId
		});
		this.mmorpg = createLocalTabClientAuthority(this, worldId);
		this.channel = new this.BroadcastChannelClass(localTabChannelName(worldId));
		this.channel.addEventListener('message', this.receiveBound);
		this.connected = true;
		this.lifecycle.start();
		publishLocalTabEnvelope(this, 'discover');
		publishLocalTabEnvelope(this, 'state', this.worldState.localPlayer());
		emitLocalTabWorld(this);
		return localTabJoinReceipt(this);
	}

	async updatePlayerState(playerState = {}) {
		const player = this.worldState?.applyTransform(playerState);
		if (player) {
			publishLocalTabEnvelope(this, 'state', player);
			emitLocalTabWorld(this);
		}
		return this.world;
	}

	input(first, strafe, facing) {
		return this.updatePlayerState(localTabInputTransform(first, strafe, facing));
	}

	async heartbeat() {
		if (!this.connected || !this.worldState) {
			return this.world;
		}
		publishLocalTabEnvelope(this, 'state', this.worldState.touchLocal());
		emitLocalTabWorld(this);
		return this.world;
	}

	onWorld(listener) {
		this.listeners.add(listener);
		if (this.world) {
			listener(this.world);
		}
		return () => this.listeners.delete(listener);
	}

	stop() {
		if (this.connected) {
			publishLocalTabEnvelope(this, 'leave');
		}
		this.lifecycle.stop();
		this.channel?.removeEventListener?.('message', this.receiveBound);
		this.channel?.close?.();
		this.channel = null;
		this.connected = false;
		this.ledger.reset();
	}
}
