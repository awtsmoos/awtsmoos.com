// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldManagedConnection.js
 * @description Opens, rejoins, and stops a browser connection with bounded backoff.
 * The Awtsmoos renews a broken wire without panic; this Awtsmoos.com manager
 * creates fresh sockets, preserves one client identity, and exposes honest states.
 */
import { MitzvahWorldBackoff } from './MitzvahWorldBackoff.js';
import { MitzvahWorldRealtimeClient } from './MitzvahWorldRealtimeClient.js';
import { waitForMitzvahWorldSocketOpen } from './MitzvahWorldSocketOpen.js';

export class MitzvahWorldManagedConnection {
	constructor(options) {
		if (!options?.url || !options?.WebSocketClass) {
			throw new Error('A URL and WebSocket class are required.');
		}
		this.WebSocketClass = options.WebSocketClass;
		this.backoff = new MitzvahWorldBackoff(options);
		this.cancelSchedule = options.cancelSchedule || clearTimeout;
		this.maximumAttempts = options.maximumAttempts ?? 8;
		this.schedule = options.schedule || setTimeout;
		this.url = options.url;
		this.activeSocket = null;
		this.attempt = 0;
		this.client = null;
		this.pendingReconnect = null;
		this.scheduled = null;
		this.state = 'idle';
		this.stopped = false;
		this.closeBound = () => this.handleClose();
	}

	async start(displayName, worldId = 'main-village') {
		this.stopped = false;
		this.state = 'connecting';
		const socket = await this.createOpenSocket();
		this.bindSocket(socket);
		this.client = new MitzvahWorldRealtimeClient(socket);
		await this.client.join(displayName, worldId);
		this.attempt = 0;
		this.state = 'connected';
		return this.client;
	}

	async reconnectNow() {
		if (this.stopped || !this.client) return null;
		this.state = 'reconnecting';
		const socket = await this.createOpenSocket();
		this.bindSocket(socket);
		await this.client.reconnect(socket);
		this.attempt = 0;
		this.state = 'connected';
		return this.client;
	}

	handleClose() {
		if (this.stopped || this.scheduled) return;
		if (this.attempt >= this.maximumAttempts) {
			this.state = 'failed';
			return;
		}
		const delay = this.backoff.delayFor(this.attempt);
		this.attempt += 1;
		this.state = 'waiting-to-reconnect';
		this.scheduled = this.schedule(() => {
			this.scheduled = null;
			this.pendingReconnect = this.reconnectNow().catch(() => {
				this.pendingReconnect = null;
				this.handleClose();
			});
		}, delay);
	}

	stop() {
		this.stopped = true;
		this.state = 'stopped';
		if (this.scheduled) this.cancelSchedule(this.scheduled);
		this.scheduled = null;
		this.activeSocket?.removeEventListener?.('close', this.closeBound);
		this.activeSocket?.close?.();
		this.activeSocket = null;
	}

	bindSocket(socket) {
		this.activeSocket?.removeEventListener?.('close', this.closeBound);
		this.activeSocket = socket;
		this.activeSocket.addEventListener('close', this.closeBound);
	}

	createOpenSocket() {
		return waitForMitzvahWorldSocketOpen(new this.WebSocketClass(this.url));
	}
}
