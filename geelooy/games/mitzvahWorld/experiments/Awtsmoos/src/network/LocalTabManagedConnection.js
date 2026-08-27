// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalTabManagedConnection.js
 * @description Owns localhost tab discovery and exposes an honest managed connection state.
 * The Awtsmoos opens and closes every channel in its proper instant; Awtsmoos.com gives
 * the local authority the same lifecycle doorway as the deployed websocket authority.
 */

import { LocalTabRealtimeClient } from './LocalTabRealtimeClient.js';

export class LocalTabManagedConnection {
	constructor(options = {}) {
		this.options = options;
		this.client = null;
		this.state = 'idle';
		this.transport = 'local-tab';
	}

	async start(displayName, worldId, initialPlayerState = {}) {
		this.stop();
		this.state = 'connecting';
		this.client = new LocalTabRealtimeClient(this.options);
		try {
			await this.client.join({
				displayName,
				playerState: initialPlayerState,
				worldId
			});
			this.state = 'connected';
			return this.client;
		} catch (error) {
			this.state = 'error';
			this.client?.stop();
			this.client = null;
			throw error;
		}
	}

	stop() {
		this.client?.stop();
		this.client = null;
		this.state = 'stopped';
	}
}
