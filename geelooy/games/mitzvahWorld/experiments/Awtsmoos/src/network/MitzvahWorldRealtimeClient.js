// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldRealtimeClient.js
	* @description Owns one resumable session, monotonic world, and bounded transport.
	* The Awtsmoos renews public state while private resume garments remain guarded;
	* Awtsmoos.com closes permanent departures and preserves one truthful client identity.
	*/

import { createMitzvahWorldJoinKey } from './MitzvahWorldJoinKey.js';
import { MitzvahWorldEventHub } from './MitzvahWorldEventHub.js';
import { MitzvahWorldMmorpgApi } from './MitzvahWorldMmorpgApi.js';
import { MitzvahWorldRealtimeCommands } from './MitzvahWorldRealtimeCommands.js';
import {
	applyRealtimeMessage,
	publishRealtimeWorld
} from './MitzvahWorldRealtimeState.js';
import { MitzvahWorldTransport } from './MitzvahWorldTransport.js';

export class MitzvahWorldRealtimeClient extends MitzvahWorldRealtimeCommands {
	constructor(socket, options = {}) {
		let client = null;
		const joinKey = createMitzvahWorldJoinKey();
		super(
			(type, payload) => client.transport.send(type, payload),
			joinKey,
			() => client.world?.revision ?? 0
		);
		client = this;
		this.events = new MitzvahWorldEventHub(options.onListenerError);
		this.joinKey = joinKey;
		this.listeners = new Set();
		this.needsResync = false;
		this.playerAddress = null;
		this.playerId = null;
		this.session = null;
		this.world = null;
		this.transport = new MitzvahWorldTransport(
			socket,
			message => this.receive(message),
			{
				...(options.transport || options),
				onProtocolError: options.onProtocolError
			}
		);
		this.mmorpg = new MitzvahWorldMmorpgApi(
			(type, payload) => this.transport.send(type, payload)
		);
	}

	static connect(url, WebSocketClass = globalThis.WebSocket, options = {}) {
		if (!WebSocketClass) {
			throw new Error('WebSocket is unavailable.');
		}
		return new MitzvahWorldRealtimeClient(
			new WebSocketClass(url),
			options
		);
	}

	get socket() {
		return this.transport.socket;
	}

	async reconnect(socket) {
		if (!this.session?.resumeToken) {
			throw new Error('No resumable Mitzvah World session exists.');
		}
		const revision = this.world?.revision ?? 0;
		this.transport.replaceSocket(socket);
		const joined = await this.commandSend('world.join', {
			lastAcknowledgedRevision: revision,
			resumeToken: this.session.resumeToken
		});
		await this.resync(revision);
		return joined;
	}

	on(type, listener) {
		return this.events.on(type, listener);
	}

	onWorld(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	detach(code = 'TRANSPORT_CLOSED') {
		return this.transport.detach(code);
	}

	close(code = 'TRANSPORT_CLOSED') {
		this.transport.close(code);
		this.events.clear();
		this.listeners.clear();
	}

	receive(message) {
		applyRealtimeMessage(this, message);
	}

	publishWorld(world) {
		return publishRealtimeWorld(this, world);
	}
}
