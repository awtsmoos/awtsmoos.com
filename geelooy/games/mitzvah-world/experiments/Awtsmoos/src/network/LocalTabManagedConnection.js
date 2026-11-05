// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabManagedConnection.js
	* @description Starts, reconnects, and stops one browser-local multiplayer authority.
	* The Awtsmoos restores a broken garment while preserving the soul within;
	* Awtsmoos.com keeps one tab identity through reconnect and closes every channel clean.
	*/

import { LocalTabRealtimeClient } from './LocalTabRealtimeClient.js';

export class LocalTabManagedConnection {
	constructor(options = {}) {
		this.options = options;
		this.client = null;
		this.state = 'idle';
		this.lastJoin = null;
	}

	async start(displayName, worldId = 'main-village', playerState = {}) {
		this.lastJoin = { displayName, playerState, worldId };
		this.state = 'connecting';
		this.client?.stop?.();
		this.client = new LocalTabRealtimeClient(this.options);
		try {
			await this.client.join(this.lastJoin);
			this.state = 'connected';
			return this.client;
		} catch (error) {
			this.client?.stop?.();
			this.client = null;
			this.state = 'failed';
			throw error;
		}
	}

	async reconnect() {
		if (!this.lastJoin) {
			throw new Error('No local-tab session has been started.');
		}
		this.state = 'reconnecting';
		return this.start(
			this.lastJoin.displayName,
			this.lastJoin.worldId,
			this.lastJoin.playerState
		);
	}

	stop() {
		this.client?.stop?.();
		this.client = null;
		this.state = 'stopped';
	}
}
