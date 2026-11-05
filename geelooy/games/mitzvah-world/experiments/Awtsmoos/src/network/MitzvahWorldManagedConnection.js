// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldManagedConnection.js
	* @description Owns one resumable session across finite socket generations.
	* The Awtsmoos renews a severed wire without multiplying the traveler;
	* Awtsmoos.com aborts stale openings and lets finite backoff restore one identity.
	*/

import { MitzvahWorldBackoff } from './MitzvahWorldBackoff.js';
import { runMitzvahWorldConnectionAttempt } from './MitzvahWorldConnectionAttempt.js';
import { MitzvahWorldManagedSocket } from './MitzvahWorldManagedSocket.js';
import { MitzvahWorldRealtimeClient } from './MitzvahWorldRealtimeClient.js';
import { MitzvahWorldReconnectLoop } from './MitzvahWorldReconnectLoop.js';

export class MitzvahWorldManagedConnection {
	constructor(options) {
		if (!options?.url || !options?.WebSocketClass) {
			throw new Error('A URL and WebSocket class are required.');
		}
		this.client = null;
		this.generation = 0;
		this.lastError = null;
		this.requestTimeoutMs = options.requestTimeoutMs ?? 8000;
		this.socketOwner = new MitzvahWorldManagedSocket(options);
		this.state = 'idle';
		this.startPromise = null;
		this.stopped = false;
		this.reconnectLoop = new MitzvahWorldReconnectLoop(
			new MitzvahWorldBackoff(options),
			options
		);
	}

	get pendingReconnect() {
		return this.reconnectLoop.pendingReconnect;
	}

	start(displayName, worldId = 'main-village') {
		if (this.startPromise) return this.startPromise;
		if (this.client && !this.stopped) {
			return Promise.resolve(this.client);
		}
		this.stopped = false;
		this.reconnectLoop.resume();
		this.state = 'connecting';
		const generation = ++this.generation;
		const operation = this.startFresh(displayName, worldId, generation);
		const tracked = operation.finally(() => {
			if (this.startPromise === tracked) {
				this.startPromise = null;
			}
		});
		this.startPromise = tracked;
		return tracked;
	}

	startFresh(displayName, worldId, generation) {
		return runMitzvahWorldConnectionAttempt({
			failureCode: 'CONNECTION_START_FAILED',
			generation,
			manager: this,
			operation: async socket => {
				this.client = new MitzvahWorldRealtimeClient(socket, {
					requestTimeoutMs: this.requestTimeoutMs
				});
				await this.client.join(displayName, worldId);
			}
		});
	}

	reconnectNow() {
		if (this.stopped || !this.client) {
			return Promise.resolve(null);
		}
		this.state = 'reconnecting';
		return runMitzvahWorldConnectionAttempt({
			failureCode: 'RECONNECT_FAILED',
			generation: this.generation,
			manager: this,
			operation: socket => this.client.reconnect(socket)
		});
	}

	handleClose(socket) {
		if (!this.socketOwner.isCurrent(socket)) return;
		this.client?.detach?.('TRANSPORT_CLOSED');
		this.socketOwner.release(socket, false);
		this.scheduleReconnect();
	}

	scheduleReconnect() {
		if (this.stopped) return;
		this.state = 'waiting-to-reconnect';
		this.reconnectLoop.start(
			() => this.reconnectNow(),
			error => {
				this.lastError = error;
				this.scheduleReconnect();
			},
			() => {
				this.state = 'failed';
			}
		);
	}

	stop() {
		this.stopped = true;
		this.generation += 1;
		this.state = 'stopped';
		this.reconnectLoop.stop();
		this.socketOwner.abortOpen();
		this.socketOwner.release(undefined, true);
		this.client?.close?.('CONNECTION_STOPPED');
		this.client = null;
	}
}
