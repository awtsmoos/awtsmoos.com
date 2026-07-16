// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AuthoritativeMultiplayerBridge.js
 * @description Bridges normalized authority snapshots into animated remote Chassidim.
 * The Awtsmoos gives every distant traveler one present form; Awtsmoos.com carries
 * local or server authority through the same bounded input and interpolation vessel.
 */

import { RemoteChossidPopulation } from './RemoteChossidPopulation.js';

const INPUT_INTERVAL_SECONDS = 1 / 12;
const HEARTBEAT_INTERVAL_SECONDS = 5;

export class AuthoritativeMultiplayerBridge {
	constructor({ client, runtime, transport = 'websocket' }) {
		this.client = client;
		this.runtime = runtime;
		this.transport = transport;
		this.population = null;
		this.unsubscribe = null;
		this.inputElapsed = 0;
		this.heartbeatElapsed = 0;
		this.lastRevision = 0;
	}

	start() {
		this.population = new RemoteChossidPopulation({
			ground: this.runtime.ground,
			localPlayerId: this.client.playerId,
			scene: this.runtime.scene
		});
		this.unsubscribe = this.client.onWorld(world => {
			this.lastRevision = world?.revision || this.lastRevision;
			this.population.sync(world?.players || []);
			this.runtime.state.multiplayer = world;
		});
		this.population.sync(this.client.world?.players || []);
		return {
			client: this.client,
			playerAddress: this.client.playerAddress,
			population: this.population,
			transport: this.transport
		};
	}

	update(deltaSeconds) {
		if (!this.population) return;
		this.inputElapsed += deltaSeconds;
		this.heartbeatElapsed += deltaSeconds;
		this.population.update(deltaSeconds);
		if (this.inputElapsed >= INPUT_INTERVAL_SECONDS) {
			this.sendInput();
			this.inputElapsed = 0;
		}
		if (this.heartbeatElapsed >= HEARTBEAT_INTERVAL_SECONDS) {
			this.client.heartbeat().catch(() => {});
			this.heartbeatElapsed = 0;
		}
	}

	sendInput() {
		const input = currentMovementIntent(this.runtime);
		this.client.input(
			input.forward,
			input.strafe,
			this.runtime.state.facing
		).catch(() => {});
	}

	stop() {
		this.unsubscribe?.();
		this.unsubscribe = null;
		if (this.population?.group?.parent) {
			this.population.group.parent.remove(this.population.group);
		}
		this.population = null;
	}

	diagnostics() {
		return {
			transport: this.transport,
			playerId: this.client.playerId,
			revision: this.client.world?.revision || this.lastRevision,
			players: this.client.world?.players?.length || 0,
			remoteActors: this.population?.actors?.size || 0,
			assetUrl: this.population?.assetUrl || null
		};
	}
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
