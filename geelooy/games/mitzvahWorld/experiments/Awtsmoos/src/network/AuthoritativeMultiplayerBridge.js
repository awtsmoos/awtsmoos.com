// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AuthoritativeMultiplayerBridge.js
 * @description Bridges runtime truth into peers, server enemies, and authoritative defense.
 * The Awtsmoos gives distant traveler and hostile one present form; Awtsmoos.com imports
 * authority only after connection while local-tab and solo truth retain their own garments.
 */

import { installMultiplayerAuthorities } from './AuthoritativeMultiplayerBridgeAuthority.js';
import { multiplayerBridgeDiagnostics, multiplayerBridgeReceipt } from './AuthoritativeMultiplayerBridgeReceipts.js';
import { RemoteChossidPopulation } from './RemoteChossidPopulation.js';
import { currentMovementIntent, runtimePlayerSnapshot } from './RuntimePlayerSnapshot.js';

export { runtimePlayerSnapshot };

const STATE_INTERVAL_SECONDS = 1 / 15;
const SERVER_HEARTBEAT_INTERVAL_SECONDS = 5;

export class AuthoritativeMultiplayerBridge {
	constructor({ client, runtime, transport = 'websocket' }) {
		Object.assign(this, {
			client,
			defenseAuthority: null,
			enemyAuthority: null,
			heartbeatElapsed: 0,
			lastRevision: 0,
			population: null,
			runtime,
			stateElapsed: 0,
			transport,
			unsubscribe: null
		});
	}

	start() {
		this.runtime.state.multiplayerLocalPlayerId = this.client.playerId;
		this.population = new RemoteChossidPopulation({
			ground: this.runtime.ground,
			localPlayerId: this.client.playerId,
			scene: this.runtime.scene
		});
		if (this.transport !== 'local-tab') {
			installMultiplayerAuthorities(this);
		}
		this.unsubscribe = this.client.onWorld(world => this.applyWorld(world));
		if (this.client.world && this.runtime.state.multiplayer !== this.client.world) {
			this.applyWorld(this.client.world);
		}
		this.publishRuntimeState();
		return multiplayerBridgeReceipt(this);
	}

	applyWorld(world) {
		this.lastRevision = world?.revision ?? this.lastRevision;
		this.population?.sync(world?.players || []);
		this.enemyAuthority?.sync(world);
		this.runtime.state.multiplayer = world;
	}

	update(deltaSeconds) {
		if (!this.population) return;
		this.stateElapsed += deltaSeconds;
		this.heartbeatElapsed += deltaSeconds;
		this.population.update(deltaSeconds);
		this.enemyAuthority?.update();
		if (this.stateElapsed >= STATE_INTERVAL_SECONDS) {
			this.publishRuntimeState();
			this.stateElapsed %= STATE_INTERVAL_SECONDS;
		}
		if (this.shouldHeartbeat()) {
			this.client.heartbeat().catch(() => {});
			this.heartbeatElapsed %= SERVER_HEARTBEAT_INTERVAL_SECONDS;
		}
	}

	publishRuntimeState() {
		const snapshot = runtimePlayerSnapshot(this.runtime);
		if (typeof this.client.updatePlayerState === 'function') {
			return this.client.updatePlayerState(snapshot).catch(() => {});
		}
		const input = currentMovementIntent(this.runtime);
		return this.client.input(
			input.forward,
			input.strafe,
			snapshot.facing
		).catch(() => {});
	}

	stop() {
		this.unsubscribe?.();
		this.unsubscribe = null;
		this.defenseAuthority?.stop();
		this.defenseAuthority = null;
		this.enemyAuthority?.stop();
		this.enemyAuthority = null;
		this.runtime.enemyAuthority = null;
		this.population?.dispose?.();
		this.population = null;
		this.runtime.state.multiplayer = null;
		this.runtime.state.multiplayerLocalPlayerId = null;
	}

	diagnostics() {
		return multiplayerBridgeDiagnostics(this);
	}

	shouldHeartbeat() {
		return this.transport !== 'local-tab'
			&& this.heartbeatElapsed >= SERVER_HEARTBEAT_INTERVAL_SECONDS;
	}
}
