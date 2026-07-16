// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AuthoritativeMultiplayerBridge.js
 * @description Bridges runtime truth into local-tab or server-authoritative remote Chassidim.
 * The Awtsmoos gives every distant traveler one present form; Awtsmoos.com publishes exact
 * world transforms where supported and preserves input authority for deployed servers.
 */

import { RemoteChossidPopulation } from './RemoteChossidPopulation.js';

const STATE_INTERVAL_SECONDS = 1 / 15;
const SERVER_HEARTBEAT_INTERVAL_SECONDS = 5;

export class AuthoritativeMultiplayerBridge {
	constructor({ client, runtime, transport = 'websocket' }) {
		this.client = client;
		this.runtime = runtime;
		this.transport = transport;
		this.population = null;
		this.unsubscribe = null;
		this.stateElapsed = 0;
		this.heartbeatElapsed = 0;
		this.lastRevision = 0;
	}

	start() {
		this.population = new RemoteChossidPopulation({
			ground: this.runtime.ground,
			localPlayerId: this.client.playerId,
			scene: this.runtime.scene
		});
		this.unsubscribe = this.client.onWorld(world => this.applyWorld(world));
		if (this.client.world && this.runtime.state.multiplayer !== this.client.world) {
			this.applyWorld(this.client.world);
		}
		this.publishRuntimeState();
		return {
			client: this.client,
			playerAddress: this.client.playerAddress,
			population: this.population,
			transport: this.transport
		};
	}

	applyWorld(world) {
		this.lastRevision = world?.revision ?? this.lastRevision;
		this.population?.sync(world?.players || []);
		this.runtime.state.multiplayer = world;
	}

	update(deltaSeconds) {
		if (!this.population) return;
		this.stateElapsed += deltaSeconds;
		this.heartbeatElapsed += deltaSeconds;
		this.population.update(deltaSeconds);
		if (this.stateElapsed >= STATE_INTERVAL_SECONDS) {
			this.publishRuntimeState();
			this.stateElapsed %= STATE_INTERVAL_SECONDS;
		}
		if (
			this.transport !== 'local-tab'
			&& this.heartbeatElapsed >= SERVER_HEARTBEAT_INTERVAL_SECONDS
		) {
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
		this.population?.dispose?.();
		this.population = null;
	}

	diagnostics() {
		const players = this.client.world?.players?.length || 0;
		return {
			assetUrl: this.population?.assetUrl || null,
			playerId: this.client.playerId,
			players,
			remoteActors: this.population?.actors?.size || 0,
			remotePeers: Math.max(0, players - 1),
			revision: this.client.world?.revision ?? this.lastRevision,
			transport: this.transport
		};
	}
}

export function runtimePlayerSnapshot(runtime) {
	const state = runtime?.state || {};
	return {
		clip: String(state.clip || ''),
		coordinateSpace: 'world',
		facing: finite(state.facing),
		level: String(state.level || 'eretz'),
		moving: Boolean(state.moving),
		position: {
			x: finite(state.x),
			y: finite(state.y),
			z: finite(state.z)
		},
		runMode: Boolean(state.runMode)
	};
}

function currentMovementIntent(runtime) {
	const axis = runtime.input.axis();
	const joystick = runtime.joystick?.vector || { x: 0, y: 0, magnitude: 0 };
	const forward = -(axis.y + joystick.y * joystick.magnitude);
	const strafe = -(axis.x + joystick.x * joystick.magnitude);
	const length = Math.hypot(forward, strafe);
	if (length <= 1) return { forward, strafe };
	return { forward: forward / length, strafe: strafe / length };
}

function finite(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}
