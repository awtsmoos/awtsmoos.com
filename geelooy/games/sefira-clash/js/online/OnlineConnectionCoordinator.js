//B"H
//Boruch Hashem
//Blessed is He

/**
 * The coordinator tends one temporary transport around a persistent server session.
 * The Awtsmoos renews both connection and identity; Awtsmoos.com discovers limits,
 * samples latency, delegates bounded resume, and keeps every timer explicitly owned.
 */

import { isDefinitiveResumeError } from './OnlineReconnectPolicy.js';
import { OnlineReconnectRunner } from './OnlineReconnectRunner.js';

/** Owns connect, capability discovery, ping sampling, and bounded automatic resume. */
export class OnlineConnectionCoordinator {
	constructor(client, options = {}) {
		this.client = client;
		this.health = client.health;
		this.pingEveryMs = options.pingEveryMs || 3000;
		this.pingTimer = null;
		this.reconnecting = false;
		this.reconnectRunner = new OnlineReconnectRunner(client);
		this.stopped = false;
		this.bindTransport();
	}

	async start() {
		this.stopped = false;
		await this.client.connect();
		await this.discoverCapabilities();
		await this.resumeStoredSession();
		this.health.setStatus('online');
		this.startPingLoop();
		return this.client.snapshot();
	}

	stop() {
		this.stopped = true;
		this.stopPingLoop();
		this.client.transport.close();
		this.health.setStatus('offline');
	}

	bindTransport() {
		this.client.transport.on('connection.open', () => {
			if (!this.reconnecting) {
				this.health.setStatus('online');
			}
		});
		this.client.transport.on('connection.close', () => {
			this.stopPingLoop();
			if (!this.stopped && this.client.resumeToken) {
				void this.reconnect();
			} else {
				this.health.setStatus('offline');
			}
		});
	}

	async discoverCapabilities() {
		const capabilities = await this.client.capabilities();
		this.health.setExpectedFrameStep(capabilities.network?.snapshotEveryFrames || 2);
		return capabilities;
	}

	async resumeStoredSession() {
		const stored = this.client.storage.load();
		if (!stored?.resumeToken || this.client.resumeToken) {
			return null;
		}
		try {
			return await this.client.resume(stored.resumeToken);
		} catch (error) {
			if (isDefinitiveResumeError(error)) {
				this.client.storage.clear();
				return null;
			}
			throw error;
		}
	}

	async reconnect() {
		if (this.reconnecting || this.stopped) {
			return false;
		}
		this.reconnecting = true;
		const recovered = await this.reconnectRunner.run(() => this.stopped);
		this.reconnecting = false;
		if (recovered) {
			this.startPingLoop();
		}
		return recovered;
	}

	startPingLoop() {
		this.stopPingLoop();
		this.pingTimer = globalThis.setInterval(() => void this.samplePing(), this.pingEveryMs);
	}

	stopPingLoop() {
		if (this.pingTimer) {
			globalThis.clearInterval(this.pingTimer);
			this.pingTimer = null;
		}
	}

	async samplePing() {
		const sentAt = Date.now();
		try {
			const pong = await this.client.ping(sentAt);
			this.health.recordPong(pong.sentAt, pong.serverTime, Date.now());
		} catch {
			// The close event owns reconnect; a missed sample leaves prior health visible.
		}
	}
}
