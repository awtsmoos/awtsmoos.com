// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file AuthoritativeMultiplayerBridge.js
	* @description Bridges runtime truth into peers, enemies, defense, Kavanah, support, and boss authority.
	* The Awtsmoos gives distant traveler and hostile one present form; Awtsmoos.com imports
	* authority only after connection while local-tab and solo truth retain their own garments.
	*/

import {
	installMultiplayerAuthorities
} from './AuthoritativeMultiplayerBridgeAuthority.js';
import {
	shouldAuthoritativeBridgeHeartbeat,
	stopAuthoritativeBridgeSystems,
	updateAuthoritativeBridgeSystems
} from './AuthoritativeMultiplayerBridgeLifecycle.js';
import {
	multiplayerBridgeDiagnostics,
	multiplayerBridgeReceipt
} from './AuthoritativeMultiplayerBridgeReceipts.js';
import {
	RemoteChossidPopulation
} from './RemoteChossidPopulation.js';
import {
	currentMovementIntent,
	runtimePlayerSnapshot
} from './RuntimePlayerSnapshot.js';

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
			peerSignature: '',
			population: null,
			runtime,
			stateElapsed: 0,
			transport,
			unsubscribe: null,
			verticalSliceAuthority: null
		});
	}

	start() {
		this.runtime.state.multiplayerLocalPlayerId = this.client.playerId;
		this.population = new RemoteChossidPopulation({
			ground: this.runtime.ground,
			localPlayerId: this.client.playerId,
			scene: this.runtime.scene
		});
		// Shared presence subscribes before combat authorities install: remote
		// travelers must keep rendering even when an authority fails to start.
		this.unsubscribe = this.client.onWorld(world => {
			this.applyWorld(world);
		});
		if (this.client.world
			&& this.runtime.state.multiplayer !== this.client.world) {
			this.applyWorld(this.client.world);
		}
		if (this.transport !== 'local-tab') {
			try {
				installMultiplayerAuthorities(this);
			} catch (error) {
				console.warn(
					'[MitzvahWorld] Multiplayer authorities unavailable; shared presence continues.',
					error
				);
			}
		}
		this.publishRuntimeState();
		return multiplayerBridgeReceipt(this);
	}

	applyWorld(world) {
		this.lastRevision = world?.revision ?? this.lastRevision;
		this.population?.sync(world?.players || []);
		this.enemyAuthority?.sync(world);
		this.runtime.state.multiplayer = world;
		// A peer joining or leaving changes the minimap's dots, but the
		// minimap only re-renders when its own refresh runs and notices a
		// peer-signature change — and the per-frame loop refreshes only the
		// bootstrap minimap, which is released at handoff, so the live
		// coordinated minimap kept a departed peer's dot forever. Refresh
		// the UI the moment the peer SET changes (join/leave/connect-flag),
		// not on movement deltas, so the refresh is cheap and the dot
		// disappears with the peer.
		const signature = peerSetSignature(world?.players || []);
		if (signature !== this.peerSignature) {
			this.peerSignature = signature;
			this.runtime.ui?.refresh?.();
		}
	}

	update(deltaSeconds) {
		if (!this.population) return;
		this.stateElapsed += deltaSeconds;
		this.heartbeatElapsed += deltaSeconds;
		updateAuthoritativeBridgeSystems(this, deltaSeconds);
		if (this.stateElapsed >= STATE_INTERVAL_SECONDS) {
			this.publishRuntimeState();
			this.stateElapsed %= STATE_INTERVAL_SECONDS;
		}
		if (shouldAuthoritativeBridgeHeartbeat(
			this,
			SERVER_HEARTBEAT_INTERVAL_SECONDS
		)) {
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
		stopAuthoritativeBridgeSystems(this);
	}

	diagnostics() {
		return multiplayerBridgeDiagnostics(this);
	}
}

/** One stable string for the peer SET (ids + connected flags), ignoring movement. */
function peerSetSignature(players) {
	return JSON.stringify(
		(players || []).map(player => [
			player?.id,
			player?.connected !== false
		]).sort((left, right) => String(left[0]).localeCompare(String(right[0])))
	);
}
